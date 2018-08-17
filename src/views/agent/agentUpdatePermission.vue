<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Form ref="update" label-position="right" :label-width="100">
            <Row class="margin-top-20">
                <Col span="8" offset="4">
                <Tree ref="tree" :data="data" show-checkbox multiple></Tree>
                </Col>
            </Row>
            <Row :gutter="30" style="margin-top:10px">
                <Col span="6" :style="{textAlign:'right'}">
                <Button type="primary" size="large" @click="update">保存</Button>
                </Col>
                <Col span="6" :style="{textAlign:'left'}">
                <Button type="ghost" size="large" @click="$router.go(-1)">取消</Button>
                </Col>
            </Row>
        </Form>
    </div>
</template>

<script>


    export default {
        name: 'searchable-table',
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                permission: [],
                post_data: {
                    field: ['id', 'name', 'title', 'pid', 'sort'],
                    agentPermission: {
                        where: {
                            agent_id: this.$route.params.id
                        }
                    }
                }
            };
        },
        methods: {
            init () {
                this.getList(this.post_data).then(res => {
                    this.data = this.util.toTree(res.list);
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/systemPermissionList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.expand = true;
                        if (item.agent_permission && item.agent_permission.length > 0) {
                            input[index].checked = true;
                        }
                    });
                    return res.data;
                });
            },
            update () {
                let permission = this.$refs.tree.getCheckedNodes().map(function (item, index, arr) {
                    if (item.children) return 0;
                    return item.id;
                }).filter(function (item, index, arr) {
                    return item > 0;
                });
                this.util.ajax(this).post('v1/agentPermission/update/' + this.$route.params.id, permission).then(res => {
                    this.util.notice(this, res);
                    if (res.status) {
                        this.$router.push({
                            name: 'agentList'
                        });
                    }
                });
            }
        },
        created () {
            this.init();
        }
    };
</script>