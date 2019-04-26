import React from "react";
import {withStyles} from "@material-ui/core/styles";

import {inject, observer} from "mobx-react";
import Summary from "./Summary";
import {NotificationManager} from "react-notifications";

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit * 2,
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`,
    },
});

@inject('IntegrationStore')
@observer
class Step5 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    componentDidMount() {
        const imports = this.integrationStore.program.totalImports;

        if (imports === 0) {
            NotificationManager.info(`Importer could not find what to import or update, records might be upto date. Click next to save mapping`, 'Information', 10000);
        }
    }

    render() {
        return (
            <Summary displayResponse={false}/>
        );
    }
}

export default withStyles(styles)(Step5);
