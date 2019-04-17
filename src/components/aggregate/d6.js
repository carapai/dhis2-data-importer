import React from "react";
import {withStyles} from "@material-ui/core/styles/index";
import {inject, observer} from "mobx-react/index";
import {InputField} from '@dhis2/d2-ui-core';


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
class D6 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {dataSet} = this.integrationStore;

        return <div>

            <InputField
                label="Mapping Name"
                type="text"
                fullWidth
                value={dataSet.mappingName}
                onChange={(value) => dataSet.handleMappingNameChange(value)}
            />
            <InputField
                label="Mapping Description"
                type="text"
                multiline
                fullWidth
                value={dataSet.mappingDescription}
                onChange={(value) => dataSet.handleMappingDescriptionChange(value)}
            />

        </div>
    }
}

export default withStyles(styles)(D6);
