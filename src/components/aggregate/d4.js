import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {Tab, Tabs} from "@dhis2/d2-ui-core";
import Badge from "@material-ui/core/Badge/Badge";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";

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
class D4 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {dataSet} = this.integrationStore;
        const {classes} = this.props;
        return <div>
            {/*<pre>{JSON.stringify(dataSet.canBeSaved, null, 2)}</pre>*/}
            <Tabs>
                <Tab label={<Badge className={classes.padding} color="secondary"
                                   badgeContent={dataSet.processed.length}>Data</Badge>}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Data Element</TableCell>
                                <TableCell>CategoryOption</TableCell>
                                <TableCell>Attribute</TableCell>
                                <TableCell>Period</TableCell>
                                <TableCell>Organisation</TableCell>
                                <TableCell>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dataSet.processed.map((s, k) => {
                                return (
                                    <TableRow key={k}>
                                        <TableCell>
                                            {s.dataElement}
                                        </TableCell>
                                        <TableCell>
                                            {s.categoryOptionCombo}
                                        </TableCell>
                                        <TableCell>
                                            {s.attributeOptionCombo}
                                        </TableCell>
                                        <TableCell>
                                            {s.period}
                                        </TableCell>
                                        <TableCell>
                                            {s.orgUnit}
                                        </TableCell>
                                        <TableCell>
                                            {s.value}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Tab>
            </Tabs>
        </div>
    }

}

export default withStyles(styles)(D4);
