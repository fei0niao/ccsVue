<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Form ref="update" label-position="right" :label-width="100">
            <Row class="margin-top-20">
                <Col span="8" offset="4">
                <Tree ref="tree" :data="data" show-checkbox multiple @on-check-change="change"></Tree>
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
                roleList: [],
                count: 0,
                total: 0,
                currentPage: 1,
                permission: [],
                post_data: {
                    field: ['id', 'name', 'title', 'pid', 'sort']
                }
            };
        },
        methods: {
            init () {
                this.getList(this.post_data).then(res => {
                    this.data = this.util.toTree(res.list);
                }).then(res => {
                    this.change();
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/systemPermissionList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.expand = true;
                        if (item.id == 5) {
                            item.disabled = true;
                        }else if (item.id == 6 || item.id == 7 || item.id == 8){
                            item.checked = true;
                            item.disabled = true;
                        }else if(item.id == 33){
                            item.disabled = true;
                        }
                    });
                    return res.data;
                });
            },
            change () {
                this.permission = this.$refs.tree.getCheckedNodes().map(function (item, index, arr) {
                    if (item.children) return 0;
                    return item.id;
                }).filter(function (item, index, arr) {
                    return item > 0;
                });
            }
        },
        created () {
            this.init();
        }
    };
</script>
