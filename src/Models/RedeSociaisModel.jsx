export default class RedeSociaisModel{
    constructor(id, tipo){
        this.id,
        this.tipo
    }

    obterLista(){
        return [
            new RedeSociaisModel(1, 'Facebook'),
            new RedeSociaisModel(2, 'Instagram'),
            new RedeSociaisModel(3, 'Twitter'),
            new RedeSociaisModel(4, "TikTOK")
        ]
    }
}