import React, {Component} from 'react';

import {
    Button,
    Col,
    Divider,
    Input,
    Layout,
    Modal,
    notification,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography
} from "antd";
import qs from "qs";
import request from "../../common/request";
import {formatDate, isEmpty} from "../../utils/utils";
import {message} from "antd/es";
import {ClearOutlined, DeleteOutlined, ExclamationCircleOutlined, SyncOutlined, UndoOutlined} from "@ant-design/icons";


const confirm = Modal.confirm;
const {Content} = Layout;
const {Search} = Input;
const {Title, Text} = Typography;

class LoginLog extends Component {

    inputRefOfClientIp = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            userId: undefined,
        },
        loading: false,
        selectedRowKeys: [],
        delBtnLoading: false,
        users: [],
    };

    componentDidMount() {
        this.loadTableData();
    }

    async loadTableData(queryParams) {
        queryParams = queryParams || this.state.queryParams;

        this.setState({
            queryParams: queryParams,
            loading: true
        });

        // queryParams
        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/login-logs/paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message);
            }
        } catch (e) {

        } finally {
            const items = data.items.map(item => {
                return {'key': item['id'], ...item}
            })
            this.setState({
                items: items,
                total: data.total,
                queryParams: queryParams,
                loading: false
            });
        }
    }

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams)
    };

    handleSearchByClientIp = clientIp => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'clientIp': clientIp,
        }
        this.loadTableData(query);
    }

    handleSearchByUsername = username => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'username': username,
        }
        this.loadTableData(query);
    }

    handleChangeByState = (state) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'state': state,
        }
        this.loadTableData(query);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/login-logs/' + this.state.selectedRowKeys.join(','));
            if (result.code === 1) {
                message.success('????????????', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    clearLoginLogs = async () => {
        this.setState({
            clearBtnLoading: true
        })
        try {
            let result = await request.post('/login-logs/clear');
            if (result.code === 1) {
                message.success('?????????????????????????????????????????????', 3);
                this.setState({
                    selectedRowKeys: []
                })
                setTimeout(function () {
                    window.location.reload();
                }, 3000);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                clearBtnLoading: false
            })
        }
    }

    render() {

        const columns = [{
            title: '??????',
            dataIndex: 'id',
            key: 'id',
            render: (id, record, index) => {
                return index + 1;
            }
        }, {
            title: '????????????',
            dataIndex: 'username',
            key: 'username'
        }, {
            title: '??????IP',
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: '????????????',
            dataIndex: 'state',
            key: 'state',
            render: text => {
                if (text === '0') {
                    return <Tag color="error">??????</Tag>
                } else {
                    return <Tag color="success">??????</Tag>
                }
            }
        }, {
            title: '????????????',
            dataIndex: 'reason',
            key: 'reason'
        }, {
            title: '?????????',
            dataIndex: 'clientUserAgent',
            key: 'clientUserAgent',
            render: (text, record) => {
                if (isEmpty(text)) {
                    return '??????';
                }
                return (
                    <Tooltip placement="topLeft" title={text}>
                        {text.split(' ')[0]}
                    </Tooltip>
                )
            }
        }, {
            title: '????????????',
            dataIndex: 'loginTime',
            key: 'loginTime',
            render: (text, record) => {

                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        }, {
            title: '????????????',
            dataIndex: 'logoutTime',
            key: 'logoutTime',
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            }
        },
            {
                title: '??????',
                key: 'action',
                render: (text, record) => {
                    return (
                        <div>
                            <Button type="link" size='small' onClick={() => {
                                confirm({
                                    title: '????????????????????????????????????????',
                                    content: '????????????????????????????????????????????????????????????',
                                    okText: '??????',
                                    okType: 'danger',
                                    cancelText: '??????',
                                    onOk() {
                                        del(record.id)
                                    }
                                });

                                const del = async (id) => {
                                    const result = await request.delete(`/login-logs/${id}`);
                                    if (result.code === 1) {
                                        notification['success']({
                                            message: '??????',
                                            description: '????????????',
                                        });
                                        this.loadTableData();
                                    } else {
                                        notification['error']({
                                            message: '??????',
                                            description: result.message,
                                        });
                                    }

                                }
                            }}>??????</Button>
                        </div>
                    )
                },
            }
        ];

        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = selectedRowKeys.length > 0;

        return (
            <>
                <Content className="site-layout-background page-content">
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={8} key={1}>
                                <Title level={3}>??????????????????</Title>
                            </Col>
                            <Col span={16} key={2} style={{textAlign: 'right'}}>
                                <Space>

                                    <Search
                                        ref={this.inputRefOfClientIp}
                                        placeholder="????????????"
                                        allowClear
                                        onSearch={this.handleSearchByUsername}
                                    />

                                    <Search
                                        ref={this.inputRefOfClientIp}
                                        placeholder="??????IP"
                                        allowClear
                                        onSearch={this.handleSearchByClientIp}
                                    />

                                    <Select
                                        style={{width: 100}}
                                        placeholder='????????????'
                                        onChange={this.handleChangeByState}
                                        defaultValue={''}
                                    >
                                        <Select.Option value=''>????????????</Select.Option>
                                        <Select.Option value='1'>????????????</Select.Option>
                                        <Select.Option value='0'>????????????</Select.Option>
                                    </Select>

                                    <Tooltip title='????????????'>

                                        <Button icon={<UndoOutlined/>} onClick={() => {
                                            this.inputRefOfClientIp.current.setValue('');
                                            this.loadTableData({
                                                pageIndex: 1,
                                                pageSize: 10,
                                                protocol: '',
                                                userId: undefined,
                                                assetId: undefined
                                            })
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Divider type="vertical"/>

                                    <Tooltip title="????????????">
                                        <Button icon={<SyncOutlined/>} onClick={() => {
                                            this.loadTableData(this.state.queryParams)
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="????????????">
                                        <Button type="dashed" danger disabled={!hasSelected} icon={<DeleteOutlined/>}
                                                loading={this.state.delBtnLoading}
                                                onClick={() => {
                                                    const content = <div>
                                                        ???????????????????????????<Text style={{color: '#1890FF'}}
                                                                       strong>{this.state.selectedRowKeys.length}</Text>???????????????
                                                    </div>;
                                                    confirm({
                                                        icon: <ExclamationCircleOutlined/>,
                                                        title: content,
                                                        content: '????????????????????????????????????????????????????????????',
                                                        onOk: () => {
                                                            this.batchDelete()
                                                        },
                                                        onCancel() {

                                                        },
                                                    });
                                                }}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="??????">
                                        <Button type="primary" danger icon={<ClearOutlined/>}
                                                loading={this.state.clearBtnLoading}
                                                onClick={() => {
                                                    const title = <Text style={{color: 'red'}}
                                                                        strong>?????????????????????????????????????????????</Text>;
                                                    confirm({
                                                        icon: <ExclamationCircleOutlined/>,
                                                        title: title,
                                                        content: '?????????????????????????????????????????????????????????????????????????????????????????????????????????',
                                                        okType: 'danger',
                                                        onOk: this.clearLoginLogs,
                                                        onCancel() {

                                                        },
                                                    });
                                                }}>

                                        </Button>
                                    </Tooltip>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table rowSelection={rowSelection}
                           dataSource={this.state.items}
                           columns={columns}
                           position={'both'}
                           pagination={{
                               showSizeChanger: true,
                               current: this.state.queryParams.pageIndex,
                               pageSize: this.state.queryParams.pageSize,
                               onChange: this.handleChangPage,
                               total: this.state.total,
                               showTotal: total => `?????? ${total} ???`
                           }}
                           loading={this.state.loading}
                    />
                </Content>
            </>
        );
    }
}

export default LoginLog;
