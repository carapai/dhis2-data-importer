import {action, observable} from "mobx";
import _ from 'lodash';

class CategoryOptionCombo {
    @observable id;
    @observable name;
    @observable mapping = {};

    @observable cell = {};

    @action setId = val => this.id = val;
    @action setName = val => this.name = val;
    @action setCell = val => this.cell = val;
    @action setMapping = val => this.mapping = val;

    @action setCellAll = de => val => {
        const obj = _.fromPairs([[de.id, val]]);
        const c = {...this.cell, ...obj};
        this.setCell(c);
    };

    @action setMappingAll = de => val => {
        const obj = _.fromPairs([[de.id, val]]);
        const c = {...this.cell, ...obj};
        this.setMapping(c);
    };
}

export default CategoryOptionCombo;
