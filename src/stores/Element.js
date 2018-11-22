import {action, observable} from "mobx";

class Element {
    @observable id;
    @observable code;
    @observable name;
    @observable categoryCombo;
    @observable valueType;

    @observable mapping;

    @observable uniqueCategoryOptionCombos;


    @action setId = val => this.id = val;
    @action setName = val => this.name = val;
    @action setCode = val => this.code = val;
    @action setCategoryCombo = val => this.categoryCombo = val;
    @action setMapping = val => this.mapping = val;
    @action setUniqueCategoryOptionCombos = val => this.uniqueCategoryOptionCombos = val;
    @action setValueType = val => this.valueType = val;


    @action handelMappingChange = (currentData, cocColumn) => val => {
        this.setMapping(val);
        if (currentData) {
            const data = currentData[val.value];
            const processed = data.map(d => {
                return {label: d[cocColumn.value], value: d[cocColumn.value]}
            });

            this.setUniqueCategoryOptionCombos(processed);
        }
    };
}

export default Element;
