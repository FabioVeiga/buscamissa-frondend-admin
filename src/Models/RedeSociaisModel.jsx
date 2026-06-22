export default class RedeSociaisModel {
    constructor(id, tipo) {
        this.id = id;
        this.tipo = tipo;
    }

    static obterLista() {
        return [
            new RedeSociaisModel(1, "Facebook"),
            new RedeSociaisModel(2, "Instagram"),
            new RedeSociaisModel(3, "Youtube"),
            new RedeSociaisModel(4, "TikTok"),
        ];
    }

    static obterNomePorId(id) {
        return RedeSociaisModel.obterLista().find(
            (redeSocial) => redeSocial.id === Number(id)
        )?.tipo || "Rede social";
    }
}