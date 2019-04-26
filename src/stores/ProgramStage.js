import {action, computed, observable} from "mobx";

class ProgramStage {
    @observable id;
    @observable name;
    @observable displayName;
    @observable repeatable;
    @observable programStageDataElements = [];

    @observable dataElementsFilter;

    @observable page = 0;
    @observable rowsPerPage = 5;

    @observable orderBy = 'compulsory';
    @observable order = 'desc';

    @observable eventDateIdentifiesEvent = false;
    @observable completeEvents = false;
    @observable longitudeColumn;
    @observable latitudeColumn;
    @observable createNewEvents = false;
    @observable updateEvents = true;
    @observable eventDateColumn;

    constructor(id, name, displayName, repeatable, programStageDataElements) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.repeatable = repeatable;
        this.programStageDataElements = programStageDataElements;
    }

    @action
    filterDataElements = val => this.dataElementsFilter = val.toLowerCase();

    @action
    handleChangeElementPage = (event, page) => this.page = page;

    @action
    handleChangeElementRowsPerPage = event => this.rowsPerPage = event.target.value;

    @action setOrder(order) {
        this.order = order;
    }

    @action setOrderBy(orderBy) {
        this.orderBy = orderBy;
    }

    @action createSortHandler = property => event => {
        const orderBy = property;
        let order = 'desc';

        if (this.orderBy === property && this.order === 'desc') {
            order = 'asc';
        }
        this.setOrderBy(orderBy);
        this.setOrder(order);

    };

    @action makeEventDateAsIdentifier = event => this.eventDateIdentifiesEvent = event.target.checked;
    @action markEventsAsComplete = event => this.completeEvents = event.target.checked;
    @action setEventDateAsIdentifier = val => this.eventDateIdentifiesEvent = val;

    @action setLongitudeColumn = value => this.longitudeColumn = value;
    @action setLatitudeColumn = value => this.latitudeColumn = value;
    @action setCompleteEvents = value => this.completeEvents = value;
    @action setEventDateColumn = value => this.eventDateColumn = value;
    @action setCreateNewEvents = val => this.createNewEvents = val;
    @action setUpdateEvents = val => this.updateEvents = val;


    @action
    handleCreateNewEventsCheck = event => {
        this.createNewEvents = event.target.checked;

        if (!this.createNewEvents && !this.updateEvents) {
            this.eventDateColumn = null;
        }
    };

    @action
    handleUpdateEventsCheck = event => {
        this.updateEvents = event.target.checked;
        if (!this.createNewEvents && !this.updateEvents) {
            this.eventDateColumn = null;
        }
    };

    @computed
    get dataElements() {
        const sorter = this.order === 'desc'
            ? (a, b) => (b[this.orderBy] < a[this.orderBy] ? -1 : 1)
            : (a, b) => (a[this.orderBy] < b[this.orderBy] ? -1 : 1);

        /*const elements = this.programStageDataElements.map(e => {
            return {...e, ...e.dataElement};
        });*/
        return this.programStageDataElements.filter(item => {
            const displayName = item.dataElement.displayName.toLowerCase();
            return displayName.includes(this.dataElementsFilter ? this.dataElementsFilter : '')
        }).sort(sorter).slice(this.page * this.rowsPerPage, this.page * this.rowsPerPage + this.rowsPerPage);
    }

    @computed
    get pages() {
        return this.programStageDataElements.length;
    }

}

export default ProgramStage;
