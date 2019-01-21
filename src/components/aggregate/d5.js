import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
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
class D5 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;

        this.integrationStore.dataSet.create();
    }

    render() {
        const {classes} = this.props;
        const {errors, importCount, conflicts} = this.integrationStore.dataSet.processedResponses;
        let progress = '';

        if (this.integrationStore.dataSet.displayProgress) {
            progress = <LinearProgress variant="indeterminate" color="secondary"/>
        } else {
            progress = '';
        }
        return <div>
            {progress}
            <Tabs>
                <Tab label="Summary">
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
                </Tab>
                <Tab label={<Badge className={classes.padding} color="secondary"
                                   badgeContent={errors.length}>Errors</Badge>}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {errors.map((s, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {s.message}
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

export default withStyles(styles)(D5);
