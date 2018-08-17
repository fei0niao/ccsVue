<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Col span="24">
            <Card>
                <p slot="title">
                    <Icon type="help-buoy"></Icon>
                    统计信息：......
                </p>
                <Row>
                    <Col span="24" :style="{textAlign:'right'}">
                    <Input v-model="post_data.search.stock_code" clearable placeholder="股票代码" style="width: 120px"/>
                    <Input v-model="post_data.search.stock_name" clearable placeholder="股票名称" style="width: 120px"/>
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
            </Col>
        </Row>
    </div>
</template>

<script>

    import excel from '../common/excel';
    export default {
        name: 'searchable-table',
        components: {excel},
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                columns: [
                    {
                        title: '股票代码',
                        key: 'stock_code'
                    },
                    {
                        title: '股票名称',
                        key: 'stock_name'
                    },
                    {
                        title: '股票拼音',
                        key: 'stock_pingying'
                    },
                    {
                        title: '所属行业',
                        key: 'stock_industry'
                    },
                    {
                        title: '股票板块',
                        key: 'new_stock_category'
                    },
                    {
                        title: '是否启用',
                        key: 'new_is_stock_enable'
                    },
                    {
                        title: '停牌时间',
                        key: 'trading_halt_time'
                    },
                    {
                        title: '复牌时间',
                        key: 'resumption_time'
                    },
                    {
                        title: '停复牌状态',
                        key: 'new_halt_status'
                    },
                    {
                        title: '除权除息公告日',
                        key: 'announcement_day'
                    },
                    {
                        title: '股权登记日',
                        key: 'record_date'
                    },
                    {
                        title: '除权除息日',
                        key: 'ex_dividend_day'
                    },
                    {
                        title: '除权增股倍数',
                        key: 'ex_rights_stock_times'
                    },
                    {
                        title: '除息金额',
                        key: 'without_dividend'
                    },
                    {
                        title: '除权除息说明',
                        key: 'description'
                    },
                    {
                        title: '备注',
                        key: 'remark'
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_is_stock_enable', 'new_stock_category', 'new_halt_status'],
                    search: {
                        stock_code: '',
                        stock_name: ''
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
                return this.util.ajax(this).post('v1/stockList', params).then(res => {
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
            }
        },
        activated () {
            this.init();
        }
    };
</script>
