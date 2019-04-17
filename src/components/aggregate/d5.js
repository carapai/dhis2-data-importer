import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";

import Progress from "../progress";

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
class D5 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    componentDidMount() {
        this.integrationStore.dataSet.create();
    }

    render() {
        const {importCount, conflicts} = this.integrationStore.dataSet.processedResponses;
        return <div>


            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Message</TableCell>
                        <TableCell>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            Imported
                        </TableCell>
                        <TableCell>
                            {importCount.imported}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Updated
                        </TableCell>
                        <TableCell>
                            {importCount.updated}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Ignored
                        </TableCell>
                        <TableCell>
                            {importCount.ignored}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Deleted
                        </TableCell>
                        <TableCell>
                            {importCount.deleted}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <h4>Conflicts</h4>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Affected</TableCell>
                        <TableCell>Message</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {conflicts.map((s, k) => {
                        return (
                            <TableRow key={k}>
                                <TableCell>
                                    {s.object}
                                </TableCell>
                                <TableCell>
                                    {s.value}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <Progress open={this.integrationStore.dataSet.dialogOpen}
                      onClose={this.integrationStore.dataSet.closeDialog}/>
        </div>
    }

}

export default withStyles(styles)(D5);
