<?php
class ObjectLink {
	public $sql;
	public $u;
	public $object;
	public $link;
	
    public function __construct(SQL &$sql, $object, $link, $dbType){
		$this->sql = $sql;
		$this->object = isset($object) ? $object : "object";
		$this->link = isset($link) ? $link : "link";
    }

	public function addObject($params){
		$n = $params->val;
		return $this->sql->iT([$this->object, "n", "'$n'"]);
	}

	public function addLink($params){
		$o1 = $params->o1;
		$o2 = isset($params->o2) ? $params->o2 : 0;
		$c = isset($params->c) ? $params->c : 2;
		$u = $this->u;
		
		$c_ = $this->getLink(Array("o1"=>$o1,"o2"=>o2));
		if ($c_) {
			return $this->sql->uT([$this->link, "c = $c, d = CURRENT_TIMESTAMP, u = $u", $o2 ? "and o1=$o1 and o2=$o2" : "and id=$o1"]);
		} else {
			return $this->sql->iT([$this->link, "o1, o2, c, d, u", "$o1,$o2,$c,CURRENT_TIMESTAMP,$u"]);  
		}
	}

	private function getLink($params){
		$o1 = $params->o1;
		$o2 = $params->o2;
		$ret = $this->sql->sT([$this->link, "id", " and o1 = '$o1' and o2 = '$o2' ", "", ""]);
		return count($ret) ? $ret[0][0] : 0;
	}
	
	
	
}


?>