<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Col span="24">
            <Card>
                <Row>
                    <Col span="24" :style="{textAlign:'right'}">
                    <Input v-model="post_data.search.remark" clearable placeholder="参数名" style="width: 120px"/>
                    <Button type="primary" shape="circle" icon="ios-search" @click="pageChange(1)"></Button>
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
        <template>
            <Modal
                width="40"
                v-model="updateModal"
                title="修改系统参数"
                okText="修改"
                :loading="okloading"
                @on-ok="update(info.id, info,'update')">
                <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
                    <FormItem label="参数名" prop="name">
                        <Input v-model="info.remark" disabled></Input>
                    </FormItem>
                    <FormItem label="参数值" prop="param_value">
                        <template v-if="info.param_type == 1">
                            <Input v-model="info.param_value"></Input>
                        </template>
                        <template v-if="info.param_type == 2">
                            <i-switch v-model="info.param_value" size="large" true-value="1" false-value="0">
                                <span slot="open">是</span>
                                <span slot="close">否</span>
                            </i-switch>
                        </template>
                        <template v-if="info.param_type == 3">
                            <Input :value="round(info.param_value*100 || 0)" @input="v=>{formatValue(info, 'param_value', v, 0.01)}">
                            <span slot="append"> %</span>
                            </Input>
                        </template>
                        <template v-if="info.param_type == 4">
                            <fileUpload v-model="info.param_value"></fileUpload>
                        </template>
                    </FormItem>
                </Form>
            </Modal>
        </template>
    </div>
</template>

<script>

    import fileUpload from '../common/fileUpload.vue';
    export default {
        name: 'searchable-table',
        components: {fileUpload},
        props: ['userInfo'],
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                updateModal: false,
                updateRuler: {
                    param_value: [
                        {
                            required: true,
                            message: '参数值不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ]
                },
                createForm: {},
                info: {},
                columns: [
                    {
                        title: '代理商ID',
                        key: 'agent_id'
                    },
                    {
                        title: '参数名',
                        key: 'remark'
                    },
                    {
                        title: '参数值',
                        key: 'new_param_value'
                    },
                    {
                        title: '修改时间',
                        key: 'updated_time'
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
                                    style: {},
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['*']};
                                            this.getInfo(params.row.id, postParams, 'updateModal');
                                        }
                                    }
                                }, '修改')
                            ]);
                        }
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_param_value'],
                    search: {
                        remark: ''
                    },
                    where: {
                        agent_id: this.$route.params.id
                    },
                    count: true,
                    offset: 0,
                    limit: 10
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
                return this.util.ajax(this).post('v1/systemParamList', params).then(res => {
                    return res.data;
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/systemParamInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            update ($id, postParams, ref) {
                this.util.valid(this, ref).then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/systemParam/update/' + $id, postParams).then(res => {
                        if (ref) this[ref + 'Modal'] = false;
                        this.util.notice(this, res);
                        this.init();
                    });
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
        mounted () {
            this.init();
        }
    };
</script>