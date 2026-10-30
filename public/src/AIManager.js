import * as tf from '@tensorflow/tfjs';

export default class AIManager {
    constructor(scene, popSize) {
        this.scene = scene;
        this.popSize = popSize;
        this.population = []; // Vai guardar as redes neurais

        // Cria a população inicial
        for (let i = 0; i < this.popSize; i++) {
            this.population.push(this.createModel());
        }
    }

    createModel() {
        const model = tf.sequential();
        // Camada Oculta: recebe os 9 inputs e processa em 16 "neurônios"
        model.add(tf.layers.dense({
            units: 16,
            inputShape: [4],
            activation: 'relu'
        }));

        // Camada de Saída: devolve 6 valores entre 0 e 1 (por isso a ativação 'sigmoid')
        model.add(tf.layers.dense({
            units: 6,
            activation: 'sigmoid'
        }));

        return model;
    }

    think(model, inputsArray) {
        // tf.tidy limpa automaticamente os tensores usados aqui dentro
        return tf.tidy(() => {
            // 1. Converte o array JS para Tensor (matriz matemática do TF)
            const inputTensor = tf.tensor2d([inputsArray]);

            // 2. Roda a rede neural
            const outputTensor = model.predict(inputTensor);

            // 3. Extrai os dados do tensor de volta para um Array JS padrão
            const outputs = outputTensor.dataSync();

            return outputs; // Array com 6 números (ex: [0.1, 0.9, 0.4, ...])
        });
    }


    nextGeneration(players) {
        // 1. Encontra o player com o maior score
        let bestPlayer = players[0];
        players.forEach(p => {
            if (p.score > bestPlayer.score) bestPlayer = p;
        });

        const bestModel = bestPlayer.brain; // O cérebro do campeão

        // 2. Limpa a população antiga da memória da GPU
        this.population.forEach(model => {
            if (model !== bestModel) model.dispose();
        });
        this.population = [];

        // 3. O Campeão passa direto para a próxima geração (Elitismo)
        this.population.push(bestModel);

        // 4. Cria os "filhos" baseados no campeão
        for (let i = 1; i < this.popSize; i++) {
            this.population.push(this.mutate(bestModel));
        }

        // 5. Reseta os players entregando os novos cérebros
        players.forEach((player, index) => {
            player.reset(150, 700, this.population[index]);
        });
    }

    mutate(bestModel, mutationRate = 0.05) {
        return tf.tidy(() => {
            const newModel = this.createModel(); // Cria um modelo zerado
            const weights = bestModel.getWeights(); // Pega os pesos do campeão

            const mutatedWeights = [];
            for (let i = 0; i < weights.length; i++) {
                const tensor = weights[i];

                // Cria uma matriz de "ruído" aleatório do mesmo tamanho do tensor original
                const noise = tf.randomNormal(tensor.shape, 0, 1).mul(mutationRate);

                // Soma os pesos originais com o ruído
                mutatedWeights.push(tensor.add(noise));
            }

            // Injeta os pesos mutados no novo modelo
            newModel.setWeights(mutatedWeights);
            return newModel;
        });
    }
}