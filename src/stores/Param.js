import {action, observable} from "mobx";

class Param {
    @observable param = '';
    @observable value = '';

    @action
    setValue = value => this.value = value;
    @action
    setParam = value => this.param = value;
}

export default Param;
