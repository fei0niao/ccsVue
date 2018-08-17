<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row>
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='accounting_time' holderText="记账时间筛选"></dateRange>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
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
                columns: [
                    {
                        title: 'ID',
                        key: 'id'
                    },
                    {
                        title: '平台当日流水金额',
                        key: 'platform_flow_money'
                    },
                    {
                        title: '记账金额',
                        key: 'accounting_money'
                    },
                    {
                        title: '记账类型',
                        key: 'new_accounting_type'
                    },
                    {
                        title: '记账时间',
                        key: 'accounting_time'
                    },
                    {
                        title: '充值账户余额',
                        key: 'account_left_money'
                    },
                    {
                        title: '历史成交金额',
                        key: 'history_bargin_money'
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_accounting_type'],
                    whereBetween: {
                        accounting_time: []
                    },
                    count: true,
                    offset: 0,
                    limit: 10,
                    order: 'id desc'
                }
            };
        },
        methods: {
            init () {
                this.getList(this.post_data).then(res => {
                    this.total = res.count;
                    this.data = res.list;
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/platformFlowList', params).then(res => {
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
                    this.util.ajax(this).post('v1/platformFlow/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/platformFlowInfo/' + $id, postParams).then(res => {
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
                this.util.ajax(this).post('v1/platformFlow/update/' + $id, postParams).then(res => {
                    if (modalName) {
                        this[modalName] = false; // 传变量只有通过[]
                    }
                    this.util.notice(this, res);
                    this.init();
                });
            }
        },
        activated () {
            this.init();
        }
    };
</script>