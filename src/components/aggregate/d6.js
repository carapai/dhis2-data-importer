import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";

const styles = theme => ({});


@inject('IntegrationStore')
@observer
class D6 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
        this.integrationStore.checkDataStore();
    }

    render() {
        return <div>
            Step 6
        </div>
    }

}

export default withStyles(styles)(D6);
