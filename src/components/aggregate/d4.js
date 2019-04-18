import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {Table, Tabs} from 'antd';
import * as PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";

const TabPane = Tabs.TabPane;

const columns = [
    {title: 'Data Element', dataIndex: 'dataElement', key: 'dataElement'},
    {title: 'Category Option', dataIndex: 'categoryOptionCombo', key: 'categoryOptionCombo'},
    {title: 'Attribute Combo', dataIndex: 'attributeOptionCombo', key: 'attributeOptionCombo'},
    {title: 'Period', dataIndex: 'period', key: 'period'},
    {title: 'Organisation', dataIndex: 'orgUnit', key: 'orgUnit'},
    {title: 'Value', dataIndex: 'value', key: 'value'},
];

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

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
        return <Tabs defaultActiveKey="1">
            <TabPane tab={<Badge color="secondary" className={classes.padding}
                                 badgeContent={dataSet.processed.length}>
                Data</Badge>} key="1">
                <Table
                    columns={columns}
                    rowKey="id"
                    dataSource={dataSet.finalData}
                />
            </TabPane>
            <TabPane tab="Code" key="2">
                <pre>{JSON.stringify({dataValues:dataSet.processed})}</pre>
            </TabPane>
        </Tabs>
    }

}

export default withStyles(styles)(D4);
