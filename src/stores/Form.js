import {action, computed, observable} from "mobx";
import _ from 'lodash';


class Form {
    @observable categoryOptionCombos = [];
    @observable dataElements = [];
    @observable templateType = '1';

    @action setCategoryOptionCombos = val => this.categoryOptionCombos = val;
    @action setDataElements = val => this.dataElements = val;
    @action setTemplateType = val => this.templateType = val;

    @computed get status() {
        let map = {};
        for (const e  of this.dataElements) {
            const ifMapped = this.categoryOptionCombos.map(c => {
                if (this.templateType === '1') {
                    return !!c.mapping[e.id];
                } else if (this.templateType === '2') {
                    return !!c.cell[e.id];
                } else if (this.templateType === '3') {
                    return !!c.column[e.id];
                }
                return true;
            });

            map = {...map, [e.id]: {some: _.some(ifMapped), all: _.every(ifMapped)}}

        }
        return map;
    }

}

export default Form;
