<?php
class ObjectLink {
	private $sql;
	private $object;
	private $link;
	
    public function __construct(SQL &$sql, $object, $link, $dbType){
		$this->sql = $sql;
		$this->object = isset($object) ? $object : "object";
		$this->link = isset($link) ? $link : "link";
    }

	public function install(){//create database
		try {
			$sqlObject = file_get_contents(($this->object).".sql");
			$sqlLink = file_get_contents(($this->link).".sql");
			if ($sqlObject) $retO = $this->sql->sql([$sqlObject]);
			if ($sqlLink) $retL = $this->sql->sql([$sqlLink]);
			$ret = $retO && $retL;
			if ($ret){
				$o1 = +$this->cL((object)Array( "o1"=>"root", "o2"=>1, "c"=>1, "u"=>1 ));
				$o2 = +$this->cL((object)Array( "o1"=>"202cb962ac59075b964b07152d234b70", "o2"=>1, "c"=>1, "u"=>1 ));//password=123
				return $this->cL((object)Array( "o1"=>+$o1, "o2"=>+$o2, "c"=>1, "u"=>1 ));
			}
		} catch (Exception $e) {
			print($e);
			return null;
		}
	}

	public function setLink($params, $notPolicy=false){
		$o2 = isset($params->o2) ? $params->o2 : 1;
		$user = isset($params->user) ? $params->user : "";
		$pass = isset($params->pass) ? $params->pass : "";
		$c = isset($params->c) ? $params->c : 1;
		
		$func = "setLink";
		$policy = $notPolicy || ( $this->getPolicy((object)Array( "id"=>$o2, "func"=>$func, "user"=>$user, "pass"=>$pass )) );
		if (!$policy) return 0;
		
		$o1 = is_int($params->o1) ? $params->o1 : ( is_string($params->o1) ? +$this->sql->iT([$this->object, "n", "'$params->o1'"]) : 0 );
		if (!$o1) return 0;
		
		$ret = $this->sql->sT([$this->link, "id", " and o1 = $o1 and o2 = $o2 ", "", ""]);
		$id = count($ret) ? $ret[0][0] : 0;
		if ($id) {
			$this->sql->uT([$this->link, "c = $c, d = CURRENT_TIMESTAMP, u = $u", $o2 ? "and o1=$o1 and o2=$o2" : "and id=$o1"]);
		} else {
			$this->sql->iT([$this->link, "o1, o2, c, d, u", "$o1, $o2, $c, CURRENT_TIMESTAMP, $u"]);  
		}
		return +$o1;
	}
	
	public function getLink($params, $notPolicy=false){
		try {
			$o1 = $params->o1;
			$o2 = isset($params->o2) && $params->o2 ? $params->o2 : 0;
			//$c = isset($params->c) ? $params->c : 1;
			$user = isset($params->user) ? $params->user : "";
			$pass = isset($params->pass) ? $params->pass : "";
			$func = "getLink";
			$policy = $notPolicy || ( 
				$this->getPolicy((object)Array( "id"=>$o1, "func"=>$func, "user"=>$user, "pass"=>$pass )) && 
				$this->getPolicy((object)Array( "id"=>$o2, "func"=>$func, "user"=>$user, "pass"=>$pass )) 
			);

			if ( $o1 && $o2 && ( $notPolicy || $policy ) ) {;
				if ( !is_int($o1) && is_string($o1) ){
					$o2_ = is_int($o2) ? $o2 : 1;
					$ret = $this->sql->sT([$this->link, "o1", "and o2=$o2_ and o1 in (select id from $this->object where n = '$o1')", "", "limit 1"]);
					$o1 = count($ret) ? +$ret[0][0] : 0;
				}
				if ( !is_int($o2) && is_string($o2) ){
					$ret = $this->sql->sT([$this->link, "o1", "and o2=1 and o1 in (select id from $this->object where n = '$o2')", "", "limit 1"]);
					$o2 = count($ret) ? +$ret[0][0] : 0;
				}
			
				$sel = <<<H
					select o.id, o.n, l.c, l.d, l.u from (
							select o1 from (
								select o1 from $this->link where 1=1 and o2 = $o1 /*and o1<>$o1*/
								union all
								select o1 from $this->link where 1=1 and o2 = $o2 /*and o1<>$o2*/
							)l
							group by o1 having count(o1)=2
					)x
					left join $this->link l on x.o1 = l.o1 and l.o2 = $o1
					left join (select id, n from $this->object) o on o.id = l.o1 
					order by c desc, d desc			
H;
			//return str_replace(array("\r","\n","\t")," ",$sel);
				$ret = $sel ? $this->sql->sT(["(".$sel.")x ", "*", ""]) : [];
				return $ret;
			} else {
				return [];
				
			}
		} catch (Exception $e){
			print($e);
			return [];
		}
	}	
	
	public function getPolicy($params){
		try {
			$id = $params->id;
			$func = $params->func;
			$user = $params->user;
			$pass = $params->pass;
			
			if (is_int($user) || is_int($pass)) return 0;
			
			$policy = 0;
			$funcid = 0;
			$ret = $this->getLink((object)Array("o1"=>$user, "o2"=>$pass),true);
			forEach ( $ret as $o){ if ($o[1]==$func) { $funcid=+$o[0]; break; } };

			if ($funcid){
				$ret = $this->getLink((object)Array("o1"=>$funcid, "o2"=>$funcid),true);
				forEach ($ret as $o){ 
					if ((is_int($id) && +$o[0]==+$id) || (is_string($id) && $o[1]==$id)) { $policy=$funcid; break; } 
				};
			}
			return $policy;
		
		} catch (Exception $e){
			print($e);
			return null;
		}
	}
	
}

/*
	public function cL($params){
		$o1 = is_int($params->o1) ? $params->o1 : (is_string($params->o1) ? +$this->sql->iT([$this->object, "n", "'$params->o1'"]) : 0);
		$o2 = isset($params->o2) ? $params->o2 : 1;
		$c = isset($params->c) ? $params->c : 1;
		$u = isset($params->u) ? $params->u : 0;
		if (!$o1 || !$o2 || !$u) return;
		
		$ret = $this->sql->sT([$this->link, "id", " and o1 = $o1 and o2 = $o2 ", "", ""]);
		$id = count($ret) ? $ret[0][0] : 0;
		if ($id) {
			$this->sql->uT([$this->link, "c = $c, d = CURRENT_TIMESTAMP, u = $u", $o2 ? "and o1=$o1 and o2=$o2" : "and id=$o1"]);
		} else {
			$this->sql->iT([$this->link, "o1, o2, c, d, u", "$o1,$o2,$c,CURRENT_TIMESTAMP,$u"]);  
		}
		return +$o1;
	}
	

	
*/
/*
	public function getLink($params){
		try {
			$id = $params->id;
			$user = isset($params->user) ? $params->user : "";
			$pass = isset($params->pass) ? $params->pass : "";
			$func = "getLink";

			if ( !is_int($id) && is_string($id) ){
				$ret = $this->sql->sT([$this->link, "o1", "and o1 in (select id from $this->object where n = '$id') ", "order by c desc, d desc", "limit 1"]);
				$id = count($ret) ? +$ret[0][0] : 0;
			}

			if (!$id || !$user || !$pass || !$this->getPolicy($id, $func, $user, $pass)) return [];

			$sel = "select id, n, c, d, u from (select o1, d, c, u from link where 1=1 and o2=$id and o1<>$id)l left join (select id, n from object) o on o.id = l.o1 order by c desc, d desc";
			return $sel ? $this->sql->sT(["(".$sel.")x ", "*", ""]) : [];

		} catch (Exception $e){
			print($e);
			return null;
		}
	}
*/	

?>