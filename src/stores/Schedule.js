import {action, observable} from "mobx";
import moment from "moment";

class Schedule {
    @observable name = '';
    @observable type;
    @observable value;
    @observable schedule;
    @observable created = moment().toString();
    @observable next = '';
    @observable last = '';

    @action setName = val => this.name = val;
    @action setType = val => this.type = val;
    @action setValue = val => this.value = val;
    @action setSchedule = val => this.schedule = val;
    @action setCreated = val => this.created = val;
    @action setNext = val => this.next = val;
    @action setLast = val => this.last = val;

    @action handleScheduleChange = event => {
        this.setSchedule(event.target.value)
    };
}

export default Schedule;
