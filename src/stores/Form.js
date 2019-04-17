import {action, computed, observable} from "mobx";
import _ from 'lodash';


class Form {
    @observable categoryOptionCombos = [];
    @observable dataElements = [];

    @action setCategoryOptionCombos = val => this.categoryOptionCombos = val;
    @action setDataElements = val => this.dataElements = val;

    @computed get status() {
        let map = {};
        for (const e  of this.dataElements) {
            const ifMapped = this.categoryOptionCombos.map(c => {
                return !!c.mapping[e.id];
            });

            map = {...map, [e.id]: {some: _.some(ifMapped), all: _.every(ifMapped)}}

        }
        return map;
    }

}

export default Form;
