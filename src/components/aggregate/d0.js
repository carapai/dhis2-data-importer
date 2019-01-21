import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Table from "@dhis2/d2-ui-table";

const styles = theme => ({});


@inject('IntegrationStore')
@observer
class D0 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
        this.integrationStore.checkAggregateDataStore();
    }

    render() {
        return <div>
            <Table
                columns={['aggregateId', 'name']}
                rows={this.integrationStore.aggregates}
                contextMenuActions={this.integrationStore.tableAggActions}
                primaryAction={this.integrationStore.useSavedAggregate}
            />
        </div>
    }

}

export default withStyles(styles)(D0);
