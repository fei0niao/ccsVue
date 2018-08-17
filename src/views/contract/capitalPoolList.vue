<style lang="less">
  @import '../../styles/common.less';
</style>

<template>
  <div>
    <Row :gutter="10">
      <Card>
        <Row>
          <Col span="12" :style="{textAlign:'left'}">
          <Button v-if = "util.permission('capitalPoolCreate')" type="primary" @click="createModal = true">新增</Button>
          &nbsp;
          </Col>
          <Col span="12" :style="{textAlign:'right'}">
          <Input v-model="post_data.where.id" clearable placeholder="资金池ID" style="width: 120px"/>
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
        v-model="createModal"
        title="新增资金池"
        okText="创建"
        :loading="okloading"
        @on-ok="create()">
        <Form ref="create" :rules="createRuler" :model="createForm" label-position="right" :label-width="100">
          <FormItem label="资金池名称" prop="capital_name">
            <Input v-model="createForm.capital_name"></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template>
      <Modal
        v-model="updateModal"
        title="修改资金池"
        okText="修改"
        :loading="okloading"
        @on-ok="vUpdate(info.id, info, 'update')">
        <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
          <FormItem label="资金池ID">
            {{info.id}}
          </FormItem>
          <FormItem label="资金池名称" prop="capital_name">
            <Input v-model="info.capital_name"></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template>
      <Modal
        v-model="parentAccountModal"
        title="母账户详情"
        width="80"
        :loading="okloading">
        <parentAccountList :capital_id="capital_id" v-if="parentAccountModal"></parentAccountList>
        <div slot="footer">
        </div>
      </Modal>
    </template>
  </div>
</template>

<script>

    import excel from '../common/excel';
    import parentAccountList from './parentAccountList';
    export default {
        name: 'searchable-table',
        components: {
            excel, parentAccountList
        },
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                parentAccountModal: false,
                createModal: false,
                createRuler: {
                    capital_name: [{required: true, message: '资金池名称不能为空', trigger: 'blur'}]
                },
                updateModal: false,
                updateRuler: {
                    capital_name: [{required: true, message: '资金池名称不能为空', trigger: 'blur'}]
                },
                createForm: {},
                info: {},
                capital_id: '',
                columns: [
                    {
                        title: '资金池ID',
                        key: 'id'
                    },
                    {
                        title: '资金池名称',
                        key: 'capital_name'
                    },
                    {
                        title: '创建时间',
                        key: 'created_time'
                    },
                    {
                        title: '更新时间',
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
                                    style: {
                                        display: this.util.permission('capitalPoolUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['id', 'capital_name']};
                                            this.getInfo(params.row.id, postParams, 'updateModal');
                                        }
                                    }
                                }, '修改'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('parentAccountList') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.capital_id = params.row.id;
                                            this.parentAccountModal = true;
                                        }
                                    }
                                }, '母账户详情')
                            ]);
                        }
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*'],
                    where: {
                        id: ''
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
                return this.util.ajax(this).post('v1/capitalPoolList', params).then(res => {
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
                    this.util.ajax(this).post('v1/capitalPool/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/capitalPoolInfo/' + $id, postParams).then(res => {
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
                this.util.ajax(this).post('v1/capitalPool/update/' + $id, postParams).then(res => {
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