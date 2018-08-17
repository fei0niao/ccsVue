<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <Card>
                <Row slot="title">
                    <ButtonGroup>
                        <Button @click="highLight!=1?highLight=1:''"
                                :type="highLight == 1?'primary':null">今日系统可分配卖出
                        </Button>
                        <Button @click="highLight!=2?highLight=2:''"
                                :type="highLight == 2?'primary':null">历史系统可分配卖出
                        </Button>
                    </ButtonGroup>
                </Row>
                <Row>
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='parent_entrust_deal_time' holderText="成交时间筛选"></dateRange>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.where.parent_finance_entrust_id" clearable placeholder="委托编号" style="width: 120px"/>
                    <Input v-model="post_data.search.stock_code" clearable placeholder="证券代码" style="width: 120px"/>
                    <Input v-model="post_data.search.stock_name" clearable placeholder="证券名称" style="width: 120px"/>
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
                v-model="assignSellModal"
                title="系统补卖"
                okText="确定"
                :loading="okloading"
                @on-ok="assignSell">
                <Form ref="assignSell" :rules="assignSellRuler" :model="info" label-position="right" :label-width="120">
                    <FormItem label="分配提示">
                        成交股票 : {{info.stock_code + ' ' + info.stock_name}}
                        <br/>
                        成交情况 : {{'卖出' + info.bargain_amount + '股, 入金' + info.bargain_price + '元'}}
                    </FormItem>
                    <FormItem label="合约ID" prop="stockFinanceId">
                        <Input v-model="info.stockFinanceId"></Input>
                    </FormItem>
                    <FormItem label="备注" prop="assignRemark">
                        <Input v-model="info.assignRemark" type="textarea" :autosize="{minRows: 3,maxRows: 6}" placeholder="描述..."></Input>
                    </FormItem>
                </Form>
            </Modal>
        </template>
    </div>
</template>

<script>

    import excel from '../common/excel';
    import dateRange from '../common/dateRange.vue';
    export default {
        name: 'searchable-table',
        components: {excel, dateRange},
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                assignSellModal: false,
                assignSellRuler: {
                    stockFinanceId: [
                        { required: true, message: '合约ID不能为空', trigger: 'blur' }
                    ],
                    assignRemark: [
                        { required: true, message: '备注不能为空', trigger: 'blur' }
                    ]
                },
                info: {},
                highLight: 1,
                highLightInfo: {
                    url: 'todayParentEntrust',
                    name: '今日系统可分配卖出',
                    javaUrl: 'assignSellDayDeal'
                },
                columns: [
                    {
                        title: '母账户ID',
                        key: 'parent_stock_finance_id'
                    },
                    {
                        title: '委托编号',
                        key: 'parent_finance_entrust_id'
                    },
                    {
                        title: '证券代码',
                        key: 'stock_code'
                    },
                    {
                        title: '证券名称',
                        key: 'stock_name'
                    },
                    {
                        title: '成交方向',
                        key: 'new_sell_buy'
                    },
                    {
                        title: '成交时间',
                        key: 'parent_entrust_deal_time'
                    },
                    {
                        title: '成交状态',
                        key: 'new_parent_entrust_status'
                    },
                    {
                        title: '成交均价',
                        key: 'bargain_average_price'
                    },
                    {
                        title: '成交数量',
                        key: 'bargain_amount'
                    },
                    {
                        title: '成交金额',
                        key: 'bargain_price'
                    },
                    {
                        title: '备注',
                        key: 'remark'
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
                                        display: this.util.permission(this.highLightInfo.javaUrl) ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {
                                                field: ['*']
                                            };
                                            this.getInfo(params.row.id, postParams, 'assignSellModal');
                                        }
                                    }
                                }, '系统补卖')
                            ]);
                        }
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_sell_buy', 'new_parent_entrust_status'],
                    where: {
                        parent_finance_entrust_id: '',
                        sell_buy: 2
                    },
                    whereBetween: {
                        parent_entrust_deal_time: []
                    },
                    search: {
                        stock_code: '',
                        stock_name: ''
                    },
                    whereIn: {
                        parent_entrust_status: [3, 5]
                    },
                    whereNull: 'stock_finance_entrust_id',
                    count: true,
                    offset: 0,
                    limit: 10,
                    order: 'id desc'
                }
            };
        },
        watch: {
            highLight: function () {
                if (this.highLight == 1) {
                    this.highLightInfo = {url: 'todayParentEntrust', name: '今日系统可分配卖出', javaUrl: 'assignSellDayDeal'};
                } else {
                    this.highLightInfo = {url: 'historyParentEntrust', name: '历史系统可分配卖出', javaUrl: 'assignSellHistoryDeal'};
                }
                this.init();
            }
        },
        methods: {
            init () {
                this.getList(this.post_data).then(res => {
                    this.total = res.count;
                    this.data = res.list;
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/' + this.highLightInfo.url + 'List', params).then(res => {
                    return res.data;
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
            create () {
                this.$refs.create.validate((valid) => {
                    if (!valid) {
                        this.okloading = false;
                        this.$nextTick(() => {
                            this.okloading = true;
                        });
                        return;
                    }
                    this.util.ajax(this).post('v1/' + this.highLightInfo.url + '/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/' + this.highLightInfo.url + 'Info/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            vUpdate ($id, postParams, rulerName) {
                this.$refs[rulerName].validate((valid) => {
                    if (!valid) {
                        this.okloading = false;
                        this.$nextTick(() => {
                            this.okloading = true;
                        });
                        return;
                    }
                    this.update($id, postParams, rulerName + 'Modal');
                });
            },
            update ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/' + this.highLightInfo.url + '/update/' + $id, postParams).then(res => {
                    if (modalName) {
                        this[modalName] = false; // 传变量只有通过[]
                    }
                    this.util.notice(this, res);
                    this.init();
                });
            },
            assignSell () {
                this.util.valid(this, 'assignSell').then(res => {
                    if (!res) return;
                    let postParams = {
                        id: this.info.id,
                        stockFinanceId: this.info.stockFinanceId,
                        remark: this.info.assignRemark
                    };
                    this.util.ajax(this).post('v1/requestApi/' + this.highLightInfo.javaUrl, postParams).then(res => {
                        this.assignSellModal = false;
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