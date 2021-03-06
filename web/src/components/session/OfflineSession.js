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
import {differTime} from "../../utils/utils";
import Playback from "./Playback";
import {message} from "antd/es";
import {
    CheckOutlined,
    ClearOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined, EyeInvisibleOutlined, EyeOutlined,
    SyncOutlined,
    UndoOutlined
} from "@ant-design/icons";
import {MODE_COLORS, PROTOCOL_COLORS} from "../../common/constants";
import './OfflineSession.css'
import dayjs from "dayjs";

const confirm = Modal.confirm;
const {Content} = Layout;
const {Search} = Input;
const {Title, Text} = Typography;

class OfflineSession extends Component {

    inputRefOfClientIp = React.createRef();

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10,
            protocol: '',
            userId: undefined,
            assetId: undefined,
            reviewed: undefined
        },
        loading: false,
        playbackVisible: false,
        playbackSessionId: null,
        videoPlayerVisible: false,
        videoPlayerSource: null,
        selectedRowKeys: [],
        delBtnLoading: false,
        users: [],
        assets: [],
        selectedRow: {},
    };

    componentDidMount() {
        this.loadTableData();
        this.handleSearchByNickname('');
        this.handleSearchByAssetName('');
    }

    async loadTableData(queryParams) {
        queryParams = queryParams || this.state.queryParams;
        queryParams['status'] = 'disconnected';

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
            let result = await request.get('/sessions/paging?' + paramsStr);
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

    showPlayback = (row) => {
        this.setState({
            playbackVisible: true,
            selectedRow: row
        });
    };

    hidePlayback = () => {
        this.setState({
            playbackVisible: false,
            playbackSessionId: null
        });
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

    handleChangeByProtocol = protocol => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'protocol': protocol,
        }
        this.loadTableData(query);
    }

    handleChangeByRead = reviewed => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'reviewed': reviewed,
        }
        this.loadTableData(query);
    }

    handleSearchByNickname = async nickname => {
        const result = await request.get(`/users/paging?pageIndex=1&pageSize=1000&nickname=${nickname}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }

        this.setState({
            users: result.data.items
        })
    }

    handleChangeByUserId = userId => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'userId': userId,
        }
        this.loadTableData(query);
    }

    handleSearchByAssetName = async assetName => {
        const result = await request.get(`/assets/paging?pageIndex=1&pageSize=100&name=${assetName}`);
        if (result.code !== 1) {
            message.error(result.message, 10);
            return;
        }

        this.setState({
            assets: result.data.items
        })
    }

    handleChangeByAssetId = (assetId, options) => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'assetId': assetId,
        }
        this.loadTableData(query);
    }

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/sessions/' + this.state.selectedRowKeys.join(','));
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

    handleAllReviewed = async () => {
        this.setState({
            reviewedAllBtnLoading: true
        })
        try {
            let result = await request.post(`/sessions/reviewed`);
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
                reviewedAllBtnLoading: false
            })
        }
    }

    handleReviewed = async () => {
        this.setState({
            reviewedBtnLoading: true
        })
        try {
            let result = await request.post(`/sessions/${this.state.selectedRowKeys.join(',')}/reviewed`);
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
                reviewedBtnLoading: false
            })
        }
    }

    handleUnreviewed = async () => {
        this.setState({
            unreviewedBtnLoading: true
        })
        try {
            let result = await request.post(`/sessions/${this.state.selectedRowKeys.join(',')}/unreviewed`);
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
                unreviewedBtnLoading: false
            })
        }
    }

    del = async (id) => {
        const result = await request.delete(`/sessions/${id}`);
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

    clearSession = async () => {
        this.setState({
            clearBtnLoading: true
        })
        try {
            let result = await request.post('/sessions/clear');
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
            },
        }, {
            title: '??????IP',
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: '????????????',
            dataIndex: 'mode',
            key: 'mode',
            render: (text) => {
                return (
                    <Tag color={MODE_COLORS[text]}>{text}</Tag>
                )
            }
        }, {
            title: '????????????',
            dataIndex: 'creatorName',
            key: 'creatorName'
        }, {
            title: '????????????',
            dataIndex: 'assetName',
            key: 'assetName'
        }, {
            title: '????????????',
            dataIndex: 'protocol',
            key: 'protocol',
            render: (text, record) => {
                const title = `${record.username}@${record.ip}:${record.port}`;
                return (
                    <Tooltip title={title}>
                        <Tag color={PROTOCOL_COLORS[text]}>{text}</Tag>
                    </Tooltip>
                )
            }
        }, {
            title: '????????????',
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            render: (text, record) => {
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            }
        }, {
            title: '????????????',
            dataIndex: 'connectedTime',
            key: 'connectedTime',
            render: (text, record) => {
                return differTime(new Date(record['connectedTime']), new Date(record['disconnectedTime']));
            }
        },
            {
                title: '??????',
                key: 'action',
                render: (text, record) => {
                    let disabled = true;
                    if (record['recording'] && record['recording'] === '1') {
                        disabled = false
                    }

                    return (
                        <div>
                            <Button type="link" size='small'
                                    disabled={disabled}
                                    onClick={() => this.showPlayback(record)}>??????</Button>
                            <Button type="link" size='small'
                                    onClick={() => {
                                        confirm({
                                            title: '?????????????????????IP???????????????????',
                                            content: '',
                                            okText: '??????',
                                            okType: 'danger',
                                            cancelText: '??????',
                                            onOk: async () => {
                                                // ?????????????????????
                                                let formData = {
                                                    ip: record['clientIp'],
                                                    rule: 'reject',
                                                    priority: 99,
                                                }
                                                const result = await request.post('/securities', formData);
                                                if (result.code === 1) {
                                                    message.success('????????????');
                                                } else {
                                                    message.error(result.message, 10);
                                                }
                                            }
                                        });
                                    }}>??????IP</Button>
                            <Button type="link" size='small' danger onClick={() => {
                                confirm({
                                    title: '???????????????????????????????',
                                    content: '',
                                    okText: '??????',
                                    okType: 'danger',
                                    cancelText: '??????',
                                    onOk: () => {
                                        this.del(record.id)
                                    }
                                });
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

        const userOptions = this.state.users.map(d => <Select.Option key={d.id}
                                                                     value={d.id}>{d.nickname}</Select.Option>);
        const assetOptions = this.state.assets.map(d => <Select.Option key={d.id}
                                                                       value={d.id}>{d.name}</Select.Option>);

        return (
            <>
                <Content className="site-layout-background page-content">
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={4} key={1}>
                                <Title level={3}>??????????????????</Title>
                            </Col>
                            <Col span={20} key={2} style={{textAlign: 'right'}}>
                                <Space>

                                    <Search
                                        ref={this.inputRefOfClientIp}
                                        placeholder="??????IP"
                                        allowClear
                                        onSearch={this.handleSearchByClientIp}
                                    />

                                    <Select
                                        style={{width: 140}}
                                        showSearch
                                        value={this.state.queryParams.userId}
                                        placeholder='????????????'
                                        onSearch={this.handleSearchByNickname}
                                        onChange={this.handleChangeByUserId}
                                        filterOption={false}
                                        allowClear
                                    >
                                        {userOptions}
                                    </Select>

                                    <Select
                                        style={{width: 140}}
                                        showSearch
                                        value={this.state.queryParams.assetId}
                                        placeholder='????????????'
                                        onSearch={this.handleSearchByAssetName}
                                        onChange={this.handleChangeByAssetId}
                                        filterOption={false}
                                    >
                                        {assetOptions}
                                    </Select>

                                    <Select onChange={this.handleChangeByRead}
                                            value={this.state.queryParams.reviewed ? this.state.queryParams.reviewed : ''}
                                            style={{width: 100}}>
                                        <Select.Option value="">????????????</Select.Option>
                                        <Select.Option value="true">????????????</Select.Option>
                                        <Select.Option value="false">????????????</Select.Option>
                                    </Select>

                                    <Select onChange={this.handleChangeByProtocol}
                                            value={this.state.queryParams.protocol ? this.state.queryParams.protocol : ''}
                                            style={{width: 100}}>
                                        <Select.Option value="">????????????</Select.Option>
                                        <Select.Option value="rdp">rdp</Select.Option>
                                        <Select.Option value="ssh">ssh</Select.Option>
                                        <Select.Option value="vnc">vnc</Select.Option>
                                        <Select.Option value="telnet">telnet</Select.Option>
                                        <Select.Option value="kubernetes">kubernetes</Select.Option>
                                    </Select>

                                    <Tooltip title='????????????'>

                                        <Button icon={<UndoOutlined/>} onClick={() => {
                                            this.inputRefOfClientIp.current.setValue('');
                                            this.loadTableData({
                                                pageIndex: 1,
                                                pageSize: 10,
                                                protocol: ''
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

                                    <Tooltip title="??????????????????">
                                        <Button icon={<CheckOutlined />}
                                                loading={this.state.reviewedAllBtnLoading}
                                                onClick={this.handleAllReviewed}>
                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="????????????">
                                        <Button disabled={!hasSelected} icon={<EyeOutlined />}
                                                loading={this.state.reviewedBtnLoading}
                                                onClick={this.handleReviewed}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="????????????">
                                        <Button disabled={!hasSelected} icon={<EyeInvisibleOutlined />}
                                                loading={this.state.unreviewedBtnLoading}
                                                onClick={this.handleUnreviewed}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="????????????">
                                        <Button type="primary" danger disabled={!hasSelected} icon={<DeleteOutlined/>}
                                                loading={this.state.delBtnLoading}
                                                onClick={() => {
                                                    const content = <div>
                                                        ???????????????????????????<Text style={{color: '#1890FF'}}
                                                                       strong>{this.state.selectedRowKeys.length}</Text>???????????????
                                                    </div>;
                                                    confirm({
                                                        icon: <ExclamationCircleOutlined/>,
                                                        content: content,
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
                                                    const content = <Text style={{color: 'red'}}
                                                                          strong>?????????????????????????????????????????????</Text>;
                                                    confirm({
                                                        icon: <ExclamationCircleOutlined/>,
                                                        content: content,
                                                        okType: 'danger',
                                                        onOk: this.clearSession,
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
                           rowClassName={(record, index) => {
                               return record['reviewed'] ? '' : 'unreviewed';
                           }}
                    />

                    {
                        this.state.playbackVisible ?
                            <Modal
                                className='modal-no-padding'
                                title={`???????????? ??????IP???${this.state.selectedRow['clientIp']} ???????????????${this.state.selectedRow['creatorName']} ???????????????${this.state.selectedRow['assetName']} ?????????${this.state.selectedRow['username']}@${this.state.selectedRow['ip']}:${this.state.selectedRow['port']}`}
                                centered={true}
                                visible={this.state.playbackVisible}
                                onCancel={this.hidePlayback}
                                width={window.innerWidth * 0.8}
                                footer={null}
                                destroyOnClose
                                maskClosable={false}
                            >
                                {
                                    this.state.selectedRow['mode'] === 'native' || this.state.selectedRow['mode'] === 'terminal' ?
                                        <iframe
                                            title='recording'
                                            style={{
                                                width: '100%',
                                                // height: this.state.iFrameHeight,
                                                overflow: 'visible'
                                            }}
                                            onLoad={() => {
                                                // constant obj = ReactDOM.findDOMNode(this);
                                                // this.setState({
                                                //     "iFrameHeight": obj.contentWindow.document.body.scrollHeight + 'px'
                                                // });
                                            }}
                                            ref="iframe"
                                            src={'./asciinema.html?sessionId=' + this.state.selectedRow['id']}
                                            width="100%"
                                            height={window.innerHeight * 0.8}
                                            frameBorder="0"
                                        />
                                        : <Playback sessionId={this.state.selectedRow['id']}/>
                                }

                            </Modal> : undefined
                    }

                </Content>
            </>
        );
    }
}

export default OfflineSession;
