import {action, observable} from "mobx";

class Form {
    @observable categoryOptionCombos = [];
    @observable dataElements = [];

    @action setCategoryOptionCombos = val => this.categoryOptionCombos = val;
    @action setDataElements = val => this.dataElements = val;

}

export default Form;
