import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {Table, TableBody, TableCell, TableHead, TableRow, withStyles} from "@material-ui/core";
import red from "@material-ui/core/colors/red";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";

const styles = theme => ({
    icon: {
        margin: theme.spacing.unit * 2
    },
    iconHover: {
        margin: theme.spacing.unit * 2,
        '&:hover': {
            color: red[800]
        }
    }
});

@inject('IntegrationStore')
@observer
class Params extends Component {

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        return (<Table>
            <TableHead>
                <TableRow>
                    <TableCell>Param</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {this.integrationStore.program.params.map((p, i) => <TableRow key={i}>
                    <TableCell>
                        <Input
                            type="text"
                            id={`param${i}`}
                            fullWidth
                            value={p.param}
                            onChange={(value) => p.setParam(value.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <Input
                            type="text"
                            fullWidth
                            id={`value${i}`}
                            value={p.value}
                            onChange={(value) => p.setValue(value.target.value)}
                        />
                    </TableCell>

                    <TableCell>
                        <Button id="deleteBtn" color="secondary"
                                onClick={this.integrationStore.program.removeParam(i)}>Remove</Button>
                    </TableCell>
                </TableRow>)}
                <TableRow>
                    <TableCell colSpan={3} align="right">
                        <Button id="addBtn" color="primary"
                                onClick={this.integrationStore.program.addParam}>ADD</Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>)
    }
}


export default withStyles(styles)(Params);
