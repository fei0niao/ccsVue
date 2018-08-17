<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row slot="title" :style="{textAlign:'right'}">
                    <Button type="primary" @click="update">保存</Button>
                </Row>
                <Row>
                    <Col span="8" offset="4" :style="{textAlign:'left'}">
                    <Select v-model="post_data.rolePermission.where.role_id" clearable style="width:120px" @on-change="init">
                        <Option v-for="item in roleList" :value="item.id" :key="item.id">{{ item.role_name }}</Option>
                    </Select>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    &nbsp;
                    </Col>
                </Row>
                <Row class="margin-top-20">
                    <Col span="8" offset="4">
                    <Tree ref="tree" :data="data" show-checkbox multiple></Tree>
                    </Col>
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
                data: [],
                roleList: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['id', 'name', 'title', 'pid', 'sort'],
                    rolePermission: {
                        where: {
                            role_id: ''
                        }
                    }
                }
            };
        },
        methods: {
            init () {
                let param = Object.assign({}, this.post_data);
                if (!this.post_data.rolePermission.where.role_id) delete param.rolePermission;
                this.getList(param).then(res => {
                    this.data = this.util.toTree(res.list);
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/systemPermissionList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.expand = true;
                        if (item.role_permission && item.role_permission.length > 0) {
                            input[index].checked = true;
                        }
                    });
                    return res.data;
                });
            },
            getRoleList () {
                let params = {where: {is_enable: 1}};
                this.util.ajax(this).post('v1/systemRoleList', params).then(res => {
                    this.roleList = res.data.list;
                });
            },
            update () {
                let permission = this.$refs.tree.getCheckedNodes().map(function (item, index, arr) {
                    if (item.children) return 0;
                    return item.id;
                }).filter(function (item, index, arr) {
                    return item > 0;
                });
                this.util.ajax(this).post('v1/systemRolePermission/update/' + this.post_data.rolePermission.where.role_id, permission).then(res => {
                    this.util.notice(this, res);
                });
            }
        },
        activated () {
            this.init();
            this.getRoleList();
        }
    };
</script>
