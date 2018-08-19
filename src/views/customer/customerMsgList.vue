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
                    <Col span="12" :style="{textAlign:'left'}">
                        <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='send_time' holderText="发送时间筛选"></dateRange>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.has.cust.search.real_name" clearable placeholder="姓名" style="width: 120px"/>
                    <Input v-model="post_data.search.cellphone" clearable placeholder="手机号" style="width: 120px"/>
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
                        title: '客户姓名',
                        key: 'real_name'
                    },
                    {
                        title: '电话号码',
                        key: 'cellphone'
                    },
                    {
                        title: '内容',
                        key: 'msg_content'
                    },
                    {
                        title: '发送时间',
                        key: 'send_time'
                    },
                    {
                        title: '发送类型',
                        key: 'new_msg_type'
                    },
                    {
                        title: '发送状态',
                        key: 'new_status'
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_status', 'new_msg_type'],
                    search: {
                        cellphone: ''
                    },
                    whereBetween: {
                        send_time: []
                    },
                    count: true,
                    offset: 0,
                    limit: 10,
                    order: 'id desc',
                    cust: {
                        field: ['id', 'real_name']
                    },
                    has: {
                        cust: {
                            search: {
                                real_name: ''
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
            },
            getList (params) {
                return this.util.ajax(this).post('v1/msgList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.real_name = item.cust ? item.cust.real_name : '';
                    });
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
            Echo.channel('channel_1')
                .listen('KFChart', (e) => {
                    console.log(111111111111111);
                });
            this.init();
        }
    };
</script>
