<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row slot="title">
                    <Button type="primary" @click="create">保存</Button>
                </Row>
                <Tabs type="card" value="name1" :style="{minHeight: 'calc(100vh - 250px)'}">
                    <TabPane label="基本信息" name="name1">
                        <agentCreateBasic ref="name1"></agentCreateBasic>
                    </TabPane>
                    <TabPane label="参数配置" name="name2">
                        <agentCreateParam ref="name2"></agentCreateParam>
                        <!--此处用v可以用arguments[0]代替，传多个参数用(v,k,...)-->
                    </TabPane>
                    <TabPane label="模块配置" name="name3">
                        <agentCreatePermission ref="name3"></agentCreatePermission>
                    </TabPane>
                </Tabs>
            </Card>
        </Row>
    </div>
</template>

<script>
    import agentCreateBasic from './agentCreateBasic';
    import agentCreateParam from './agentCreateParam';
    import agentCreatePermission from './agentCreatePermission';


    export default {
        name: 'searchable-table',
        components: {
            agentCreateBasic,
            agentCreateParam,
            agentCreatePermission
        },
        data () {
            return {
            };
        },
        methods: {
            create () {
                let params = {
                    basic: this.$refs.name1.info,
                    param: this.$refs.name2.data,
                    permission: this.$refs.name3.permission
                };
                this.util.valid(this.$refs.name1, 'update').then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/agent/create', params).then(res => {
                        this.util.notice(this, res);
                        if (res.status) {
                            this.$router.push({
                                name: 'agentList',
                                params: {refresh: true}
                            });
                        }
                    });
                });
            }
        }
    };
</script>
