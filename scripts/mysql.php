<?php
class mysql{
  protected static $_instance = NULL;
  protected $db_hostname = NULL;
  protected $db_port = NULL;
  protected $db_database = NULL;
  protected $db_username = NULL;
  protected $db_password = NULL;
  protected $last_connectionTime = 0;
  protected $errorMsg="";
  protected $pdo = 0;
  
  private function init(){
    $this->pdo=null;
    try {
      $this->last_connectionTime=time();
      $this->pdo=new PDO(
        "mysql:host={$this->db_hostname};port={$this->db_port};",
        $this->db_username,
        $this->db_password,
        array(
          PDO::ATTR_TIMEOUT => 5,
          PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
        )
      );
      $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      if($this->db_database)
        $this->selectDB($this->db_database);
    } catch(PDOException $e){
      //echo "database connect error: ({$this->db_hostname}:{$this->db_port}) \n{$e->getMessage()}\n";
      //echo "database connect error\n";
      //exit;
      throw $e;
    }
  }
  private function connectToDB($use=true){
    if(time()-$this->last_connectionTime>500){
      $this->init();
    }
  }
  private function prepare($sql){
    $this->connectToDB();
    try {
      return $this->pdo->prepare($sql); 
    }
    catch(PDOException $e){
      return false;
    }
  }
  private function _query($query,$limit_one=false){
    $this->connectToDB();
    if(@get_class($query)=='PDOStatement'){
      $this->connectToDB();
      try{
        $k=$query->execute();
        try {
          $result=$query->fetchAll(PDO::FETCH_ASSOC);
          if($limit_one){
            //if(count($result)!=1){
            //  return false;
            //}
            if(is_array($result)){
              foreach($result as $rs){
                return $rs;
              }
            }
            return false;
          }
          return $result;
        }
        catch(PDOException $e){
          return $k;
        }
      }
      catch(PDOException $e){
        $this->_errorMsg="[query error] {$e->getMessage()}\n".print_r(debug_backtrace(),1)."\n";
        echo $this->_errorMsg;
        echo "Database error!\n";
        exit;
        return false;
      }
    }
    else{
      $prepare=$this->prepare($query);
      if(@get_class($prepare)=='PDOStatement'){
        $result=$this->_query($prepare,$limit_one);
        return $result;
      }
      else
        return false;
    }
    return false;
  }
  public function __construct($db_hostname=false,$db_port="",$db_username="",$db_password="",$db_database=""){
    if($db_hostname!==false)
      $this->connect($db_hostname,$db_port,$db_username,$db_password,$db_database);
  }
  public function connect($db_hostname,$db_port,$db_username,$db_password,$db_database=""){
    try {
      if($this){
        $this->db_hostname=$db_hostname;
        $this->db_port=$db_port;
        $this->db_username=$db_username;
        $this->db_password=$db_password;
        $this->db_database=$db_database;
        $this->last_connectionTime=0;
        $this->pdo=null;
        $this->connectToDB();
        $this->selectDB($this->db_database);
        return;
      }
    } catch (\Error $ex) { // Error is the base class for all internal PHP error exceptions.
      //var_dump($ex);
    }
    if(self::$_instance==NULL)
      self::$_instance = new static($db_hostname,$db_port,$db_username,$db_password,$db_database);
  }
  public function pdo(){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    return $self->pdo;
  }
  public function driver(){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    return $self->pdo()->getAttribute(PDO::ATTR_DRIVER_NAME);
  }
  public function getIncrementValue($database,$tableName){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    if($rs=$self->_query("select `auto_increment` from  information_schema.tables where table_schema = '{$database}' and   table_name = '{$tableName}'",1))
      return intval($rs['AUTO_INCREMENT']);
    return false;
  }
  public function getInsertID(){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    $self->connectToDB();
    return $self->pdo->lastInsertId();
  }
  public function selectDB($db_database=""){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    if($db_database!="")
      if($self->db_exists($db_database)){
        $self->db_database=$db_database;
        $self->_query("use {$this->db_database}");
      }
  }
  public function getCount($sql,$bindValue=[]){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    $self->connectToDB();
    if(is_object($sql) && get_class($sql)=='PDOStatement'){
      $prepare=$sql;
    }
    else
      $prepare=$self->prepare($sql);
    foreach($bindValue as $key => $value)
      $prepare->bindValue($key,$value);
    if($rs=$self->_query($prepare,1)){
      return intval(reset($rs));
    }
    return -1;
  }
  public function db_exists($dbName){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    $self->connectToDB();
    $sql="select schema_name from information_schema.schemata where schema_name = '{$dbName}'";
    $result=$self->_query($sql);
    return ($result!==false) && (count($result)>0);
  }
  public function table_exists($tableName){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    $self->connectToDB();
    $sql="show tables like '{$tableName}'";
    $result=$self->_query($sql);
    return ($result!==false) && (count($result)>0);
  }
  public function column_exists($database,$table,$column){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    $self->connectToDB();
    $sql="select count(*) from information_schema.columns where table_schema='{$database}' and table_name='{$table}' and column_name='{$column}'";
    return $self->getCount($sql)>0;
  }
  public function query($sql,$bindValue=[],$limit_one=false){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    if(is_array($bindValue)){
      $prepare=$self->prepare($sql);
      foreach($bindValue as $key => $value){
        if($key=='file'){
          $prepare->bindValue($key,$value,PDO::PARAM_LOB);
        }
        else
          $prepare->bindValue($key,$value);
      }
    }
    else{
      if(count(func_get_args())==2){
        $limit_one=$bindValue;
      }
    }
    return $self->_query($prepare,$limit_one);
  }
  public function __destruct(){
    $this->pdo=null;
  }
  public function errorMsg(){
    //------------------------------------------------------------------------------------
    $self=NULL;
    try {
      if($this)
        $self=$this;
    } catch (\Error $ex) {
      if(self::$_instance!=NULL)
        $self=self::$_instance;
    }
    if(!$self)
      throw new Exception("[Error] mysql object instance error\n");
    //------------------------------------------------------------------------------------
    return $self->_errorMsg;
  }
};