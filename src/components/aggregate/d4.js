import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";

const styles = theme => ({});


@inject('IntegrationStore')
@observer
class D4 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {dataSet} = this.integrationStore;
        return <div>
            <pre>{JSON.stringify(dataSet.process, null, 2)}</pre>
        </div>
    }

}

export default withStyles(styles)(D4);
