<?php

class Websocket {
    const HOST = "0.0.0.0";
    const PROT = "9510";
    private $config=[
        "color"=> [
            "f387b6",
            "ef59a0",
            "b95ea3",
            "f04050",
            "fff24a",
            "f99e4d",
            "f46b43",
            "ee212d",
            "d5193d",
            "a2ce59",
            "aaa850",
            "d9e2f1",
        ],
        "Life"=>10,
        "supply"=>[10000,50000],
    ];
    protected $ws = null;
    public $_set= [
//            'task_worker_num' => 2,
            'ssl_cert_file'   => 'config/fullchain.pem',//ssl协议需要
            'ssl_key_file'    => 'config/privkey.pem',  //ssl协议需要
    ];
    public function __construct() {
        $this->ws = new Swoole\WebSocket\Server(self::HOST, self::PROT,SWOOLE_PROCESS,SWOOLE_SOCK_TCP | SWOOLE_SSL);//ssl
//        $this->ws = new Swoole\WebSocket\Server(self::HOST, self::PROT,SWOOLE_PROCESS); //非ssl
        $this->ws->set($this->_set); //非ssl 屏蔽代码
        $this->ws->on("start", [$this,"onStart"]);
        $this->ws->on("open", [$this,"onOpen"]);
        $this->ws->on("message", [$this, "onMessage"]);
        $this->ws->on("close", [$this, "onClose"]);
        $this->ws->start();
    }
    public function onOpen($ws, $frame) {

        $thiscolor = $this->config['color'][mt_rand(0, count($this->config['color']) - 1)];
        $data      = [
            "action" => "join",
            'color'  => $thiscolor,
            'people' => count($ws->connection_list()),
            "id"     => $frame->fd,
            "Life"   => $this->config['Life'],
        ];

        $this->config['color'] = array_values($this->config['color']);

        $ws->push($frame->fd, json_encode($data));
    }
    //定时任务 空投
    public function airdrop($taskid){
        $data=[
            "action"=>"airdrop",
            "x"=>mt_rand(0,2000-70),
            "y"=>mt_rand(0,2000-70),
            "id"=>time(),
            "people"=>@count($this->ws->connection_list()) ? : 0,
        ];
        if($this->ws->connection_list()){
             foreach ($this->ws->connection_list() as $fd){
                $this->ws->push($fd,json_encode($data));
            }
        }

    }
//    监听开始
    public function onStart(){
        $timer=$this->config['supply'];

        if(is_array($timer)){
            $timer=mt_rand($timer[0],$timer[1]);
        }
        swoole_timer_tick($timer, [$this,"airdrop"]);

    }
//    监听消息
    public function onMessage($ws, $frame) {
        $data = json_decode($frame->data, true);
        $data['people'] = count($ws->connection_list());
        $data           = json_encode($data);
        if($ws->connection_list()){
            foreach ($ws->connection_list() as $v) {
                if ($frame->fd != $v) {
                    @$ws->push($v, $data);
                }
            }
        }
    }
//    关闭
    public function onClose($ws, $fd) {
        $data = [
            "action" => "close",
            "id"     => $fd,
            "people" => count($ws->connection_list()) - 1,
        ];
        foreach ($ws->connection_list() as $v) {
            if ($v != $fd) {
                @$ws->push($v, json_encode($data));
            }
        }
    }
}

$obj = new Websocket();


?>

