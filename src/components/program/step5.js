import React from "react";
import {withStyles} from "@material-ui/core/styles";

import {inject, observer} from "mobx-react";
import Summary from "./Summary";

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

    render() {
        return (
            <Summary displayResponse={false}/>
        );
    }
}

export default withStyles(styles)(Step5);
