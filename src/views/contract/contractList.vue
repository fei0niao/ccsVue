<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row slot="title" type="flex" align="middle">
                    <Col span="6">
                    <ButtonGroup>
                        <Button type="primary">操盘合约</Button>
                        <Button @click="$router.push({name:'closedContractList'})">已关闭合约</Button>
                    </ButtonGroup>
                    </Col>
                    <Col span="6" style="text-align:left">
                        <span>单向冻结: <span style="color: red">{{SingleFreeze}}</span></span>
                        <span>双向冻结: <span style="color: red">{{DoubleFreeze}}</span></span>
                    </Col>
                </Row>
                <Row>
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='stock_finance_begin_time' holderText="开始时间筛选"></dateRange>
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='end_time' holderText="到期日筛选"></dateRange>
                    <Select v-model="post_data.where.status" clearable style="width:120px" placeholder="合约状态筛选" @on-change="pageChange(1)">
                        <Option v-for="item in statusList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.has.cust.search.real_name" clearable placeholder="姓名" style="width: 120px"/>
                    <Input v-model="post_data.has.cust.search.cellphone" clearable placeholder="手机号" style="width: 120px"/>
                    <Input v-model="post_data.where.cust_id" clearable placeholder="客户ID" style="width: 120px"/>
                    <Input v-model="post_data.where.id" clearable placeholder="合约ID" style="width: 120px"/>
                    <Button type="primary" shape="circle" icon="ios-search" @click="pageChange(1)"></Button>
                    <excel :vm="vm"></excel>
                    </Col>
                </Row>
                <Row class="margin-top-10">
                    <Table border :columns="columns" :data="data" :loading="loading" ref="table"></Table>
                </Row>
                <Row class="margin-top-10">
                    <Page show-elevator show-sizer show-total size="small"
                          @on-change="pageChange"
                          @on-page-size-change="pageSizeChange"
                          :current="currentPage"
                          :total="total">
                    </Page>
                </Row>
            </Card>
        </Row>
        <template>
            <Modal
                v-if="info.new_cust_risk"
                v-model="infoModal"
                title="合约详情"
                width="800"
            >
                <Row :style="{borderBottom:'1px solid #e9eaec',padding:'10px 0'}">
                    <Col span="6">
                    合约ID：{{info.id}}</Col>
                    <Col span="6">
                    开始时间：{{info.stock_finance_begin_time}}</Col>
                    <Col span="6">
                    到期时间：{{info.end_time}}</Col>
                    <Col span="6">
                    结算时间：{{info.stock_finance_settleup}}</Col>
                    <Col span="6">
                    客户ID：{{info.cust_id}}</Col>
                    <Col span="6">
                    姓名：{{info.cust ? info.cust.real_name : ''}}</Col>
                    <Col span="6">
                    手机号：{{info.cust ? info.cust.cellphone : ''}}</Col>
                </Row>
                <Row :style="{borderBottom:'1px solid #e9eaec',padding:'10px 0'}">
                    <Col span="6">
                    合约状态：{{info.new_status}}</Col>
                    <Col span="18">
                    资金池：{{info.capital_pool_id}}</Col>
                    <Col span="6">
                    合约金额：{{info.current_finance_amount}}</Col>
                    <Col span="6">
                    借款额：{{info.borrow_money}}</Col>
                    <Col span="6">
                    预警线：{{info.precautious_line_amount}}</Col>
                    <Col span="6">
                    平仓线：{{info.liiquidation_line_amount}}</Col>
                </Row>
                <Row :style="{borderBottom:'1px solid #e9eaec',padding:'10px 0'}">
                    <Col span="6">
                    当前合约资产：{{info.new_market.totalAssert}}</Col>
                    <Col span="6">
                    预警线差额：{{info.new_market.precautiousGap}}</Col>
                    <Col span="6">
                    平仓线差额：{{info.new_market.liquidationGap}}</Col>
                    <Col span="6">
                    合约可用余额：{{info.available_amount}}</Col>
                    <Col span="24">
                    合约净资产：{{info.new_market.netAsserts}}</Col>
                    <Col span="6">
                    持仓市值：{{info.new_market.marketValue}}</Col>
                    <Col span="6">
                    持仓比例：{{info.new_market.holdingRate}}</Col>
                    <Col span="6">
                    持仓盈亏：{{info.new_market.winLoss}}</Col>
                </Row>
                <Row :style="{borderBottom:'1px solid #e9eaec',padding:'10px 0'}">
                    <Row>
                        <Col span="4">
                        限买股：</Col>
                        <Col span="20">
                        <template v-for="(item, index) in info.new_cust_risk.stockRisk">
                            <Col span="10">
                            {{'[' + item.stock_code + '  ' + item.stock_name + ' 最大买入金额: ' + item.risk_control_value + ']'}}
                            </Col>
                        </template>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="6">
                        主板最大可买金额：{{info.new_cust_risk.mainBoardRisk}}</Col>
                        <Col span="6">
                        创业板最大可买金额：{{info.new_cust_risk.smallBoardRisk}}</Col>
                        <Col span="6">
                        中小板最大可买金额：{{info.new_cust_risk.secondBoardRisk}}</Col>
                    </Row>
                </Row>
                <Row :style="{padding:'10px 0'}">
                    <Col span="6">
                    买入佣金：{{info.buy_commission_rate}}</Col>
                    <Col span="6">
                    买入印花税：{{info.buy_stampduty_rate}}</Col>
                    <Col span="6">
                    买入过户费：{{info.buy_transfer_rate}}</Col>
                    <Col span="6">
                    卖出佣金：{{info.sell_commission_rate}}</Col>
                    <Col span="6">
                    卖出印花税：{{info.sell_stampduty_rate}}</Col>
                    <Col span="6">
                    卖出过户费：{{info.sell_transfer_rate}}</Col>
                </Row>
                <div slot="footer">
                    <Button type="ghost" @click="infoModal=false">返回</Button>
                </div>
            </Modal>
        </template>
        <template>
            <Modal
                v-model="updateModal"
                title="修改状态"
                okText="修改"
                :loading="okloading"
                @on-ok="update(info.id, info, 'update')">
                <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
                    <FormItem prop="status">
                        <RadioGroup v-model="info.status" vertical>
                            <Radio :label="1">
                                <span>操盘中</span>
                            </Radio>
                            <Radio :label="2">
                                <span>单向冻结</span>
                            </Radio>
                            <Radio :label="3">
                                <span>双向冻结</span>
                            </Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </Modal>
        </template>
        <template>
            <Modal
                v-model="perEveningUpModal"
                title="分笔平仓"
                width="80"
                :loading="okloading">
                <holdingList :contract_id="contract_id" v-if="perEveningUpModal"></holdingList>
                <div slot="footer">
                </div>
            </Modal>
        </template>
        <template>
            <Modal
                v-model="tradeModal"
                title="交易查询"
                width="80"
                :loading="okloading">
                <div slot="header" style="heigh:100px">
                    请选择查询项：
                    <Select v-model="compSelect" clearable style="width:100px">
                        <Option v-for="item in compList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
                </div>
                <component :contract_id="contract_id" v-bind:is="compSelect">
                </component>
                <div slot="footer">
                </div>
            </Modal>
        </template>
    </div>
</template>

<script>
    import excel from '../common/excel';
    import dateRange from '../common/dateRange.vue';
    import holdingList from '../trade/holdingList';
    import todayEntrustList from '../trade/todayEntrustList';
    import todayDealList from '../trade/todayDealList';
    import historyEntrustList from '../trade/historyEntrustList';
    import historyDealList from '../trade/historyDealList';
    import tradeFlowList from '../trade/tradeFlowList';
    import riskLogList from '../trade/riskLogList';
    export default {
        name: 'searchable-table',
        components: {
            excel, dateRange, holdingList, todayEntrustList, todayDealList, historyEntrustList, historyDealList, tradeFlowList, riskLogList
        },
        data () {
            return {
                compSelect: '',
                compList: [
                    {id: 'todayEntrustList', name: '当日委托'},
                    {id: 'todayDealList', name: '当日成交'},
                    {id: 'historyEntrustList', name: '历史委托'},
                    {id: 'historyDealList', name: '历史成交'},
                    {id: 'tradeFlowList', name: '资金流水'},
                    {id: 'holdingList', name: '股票持仓'},
                    {id: 'riskLogList', name: '风控日志'}
                ],
                vm: this,
                okloading: true,
                loading: false,
                contract_id: '',
                updateModal: false,
                updateRuler: {},
                infoModal: false,
                info: {},
                perEveningUpModal: false,
                tradeModal: false,
                columns: [
                    {
                        title: '合约ID',
                        key: 'id'
                    },
                    {
                        title: '开始时间',
                        key: 'stock_finance_begin_time'
                    },
                    {
                        title: '到期日',
                        key: 'end_time'
                    },
                    {
                        title: '资金池',
                        key: 'capital_pool_id'
                    },
                    {
                        title: '客户ID',
                        key: 'cust_id'
                    },
                    {
                        title: '姓名',
                        key: 'new_real_name'
                    },
                    {
                        title: '手机号',
                        key: 'new_cellphone'
                    },
                    {
                        title: '借款额(万)',
                        key: 'borrow_money'
                    },
                    {
                        title: '合约金额(万)',
                        key: 'current_finance_amount'
                    },
                    {
                        title: '当前合约资产',
                        key: 'new_totalAssert'
                    },
                    {
                        title: '合约可用余额',
                        key: 'available_amount'
                    },
                    {
                        title: '预警线(万)',
                        key: 'precautious_line_amount'
                    },
                    {
                        title: '平仓线(万)',
                        key: 'liiquidation_line_amount'
                    },
                    {
                        title: '预警线差额',
                        key: 'new_precautiousGap',
                        renderHeader: (h, params) => {
                            return [
                                h('span', '预警线'),
                                h('br'),
                                h('span', '差额')
                            ];
                        }
                    },
                    {
                        title: '平仓线差额',
                        key: 'new_liquidationGap'
                    },
                    {
                        title: '持仓市值',
                        key: 'new_marketValue'
                    },
                    {
                        title: '持仓比例',
                        key: 'new_holdingRate'
                    },
                    {
                        title: '盈亏',
                        key: 'new_winLoss'
                    },
                    {
                        title: '合约状态',
                        key: 'new_status'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 200,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('contractUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$router.push({
                                                name: 'contractUpdate',
                                                params: {id: params.row.id}
                                            });
                                        }
                                    }
                                }, '修改'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('contractUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['id', 'status']};
                                            this.getInfo(params.row.id, postParams, 'updateModal');
                                        }
                                    }
                                }, '改状态'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small',
                                        disabled: Boolean(params.row.available_amount || (params.row.new_market && params.row.new_market.marketValue > 0))
                                    },
                                    style: {
                                        display: this.util.permission('settleUp') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$Modal.confirm({
                                                title: '关闭并结算合约',
                                                content: '<p>确定要关闭并结算合约吗?</p>',
                                                onOk: () => {
                                                    this.util.ajax(this).post('v1/requestApi/settleUp', {id: params.row.id}).then(res => {
                                                        this.init();
                                                        return this.util.notice(this, res);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }, '关闭'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('eveningUp') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$Modal.confirm({
                                                title: '一键平仓',
                                                content: '<p>确定要全部平仓吗?</p>',
                                                onOk: () => {
                                                    this.util.ajax(this).post('v1/requestApi/eveningUp', {id: params.row.id}).then(res => {
                                                        this.init();
                                                        return this.util.notice(this, res);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }, '全部平仓'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('holdingList') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.contract_id = params.row.id;
                                            this.perEveningUpModal = true;
                                        }
                                    }
                                }, '分笔平仓'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('contractInfo') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {
                                                field: ['*', 'new_status', 'new_cust_risk', 'new_market'],
                                                cust: {
                                                    field: ['id', 'cellphone', 'real_name']
                                                },
                                                custRisk: {
                                                    field: ['*']
                                                }
                                            };
                                            this.getInfo(params.row.id, postParams, 'infoModal');
                                        }
                                    }
                                }, '详情'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {},
                                    on: {
                                        click: () => {
                                            this.contract_id = params.row.id;
                                            this.tradeModal = true;
                                            this.compSelect = '';
                                        }
                                    }
                                }, '交易查询')
                            ]);
                        }
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                SingleFreeze: '',
                DoubleFreeze: '',
                statusList: [{id: 1, name: '操盘中'}, {id: 2, name: '单向冻结'}, {id: 3, name: '双向冻结'}],
                post_data: {
                    field: ['*', 'new_status', 'new_market'],
                    where: {
                        cust_id: '',
                        id: '',
                        status: ''
                    },
                    whereIn: {
                        status: [1, 2, 3]
                    },
                    whereBetween: {
                        stock_finance_begin_time: [],
                        end_time: []
                    },
                    count: true,
                    offset: 0,
                    limit: 10,
                    order: 'id desc',
                    cust: {
                        field: ['id', 'cellphone', 'real_name']
                    },
                    has: {
                        cust: {
                            search: {
                                real_name: '',
                                cellphone: ''
                            }
                        }
                    }
                }
            };
        },
        methods: {
            init () {
                this.getList(this.post_data).then(res => {
                    this.total = res.count;
                    this.data = res.list;
                });
                this.initOther();
            },
            getList (params) {
                return this.util.ajax(this).post('v1/contractList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.new_real_name = item.cust ? item.cust.real_name : '';
                        item.new_cellphone = item.cust ? item.cust.cellphone : '';
                        item.new_totalAssert = item.new_market ? item.new_market.totalAssert : '';
                        item.new_winLoss = item.new_market ? item.new_market.winLoss : '';
                        item.new_marketValue = item.new_market ? item.new_market.marketValue : '';
                        item.new_holdingRate = item.new_market ? item.new_market.holdingRate : '';
                        item.new_precautiousGap = item.new_market ? item.new_market.precautiousGap : '';
                        item.new_liquidationGap = item.new_market ? item.new_market.liquidationGap : '';
                        item.borrow_money = item.borrow_money / 10000;
                        item.current_finance_amount = item.current_finance_amount / 10000;
                        item.precautious_line_amount = item.precautious_line_amount / 10000;
                        item.liiquidation_line_amount = item.liiquidation_line_amount / 10000;
                    });
                    return res.data;
                });
            },
            initOther () {
                return this.util.ajax(this).post('v1/contract/count', {SingleFreeze: true, DoubleFreeze: true}).then(res => {
                    this.DoubleFreeze = res.data.DoubleFreeze;
                    this.SingleFreeze = res.data.SingleFreeze;
                });
            },
            pageChange (value) {
                this.currentPage = value;
                this.post_data.offset = (value - 1) * this.post_data.limit;
                this.init();
            },
            pageSizeChange (value) {
                this.currentPage = 1;
                this.post_data.limit = value;
                this.init();
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/contractInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            update ($id, postParams, ref) {
                this.util.valid(this, ref).then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/contract/update/' + $id, postParams).then(res => {
                        if (ref) this[ref + 'Modal'] = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            }
        },
        activated () {
            this.init();
        }
    };
</script>
