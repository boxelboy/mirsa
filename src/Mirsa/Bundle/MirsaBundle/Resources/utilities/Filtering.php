<?php
/**
 * Filtering
 *
 * @author cps
 * @link
 */

namespace Mirsa\Bundle\MirsaBundle\Resources\utilities;

class Filtering 
{
	
	public function DateFilter($dateFilter, $value, $qb, $alias)
	{
		/*switch ($dateFilter){
			case 'dateCreated':
				break;
			case 'dateScheduled':
				break;
			case 'dateReceived':
				break;
		}*/
		
	    if (strpos($value, "...") > -1) {
	    	$dates = explode("...",$value);
	    	for ($i = 0; $i < sizeOf($dates); $i++)
	    	{
                    $hash = explode("/", $dates[$i]);
	            $dates[$i] = $hash[1]."/".$hash[0]."/".$hash[2];
	        }
	        $qb->andWhere($alias.'.'.$dateFilter.' BETWEEN \''.$dates[0].'\' AND \''.$dates[1].'\'');
	     } elseif (strpos($value, ">") > -1) {
	      	$hash = explode("/", substr($value, -7));
	        $datec = $hash[1]."-".$hash[0]."-01";
	        $date = date("t/m/Y", strtotime($datec));
	        $qb->andWhere($alias.'.'.$dateFilter.' > \''.$date.'\' ');
	     } elseif (strpos($value, "==") > -1) {
	      	$hash = explode("/", substr($value, -7));
	        $datec = $hash[1]."-".$hash[0]."-01";
	        $endDate = date("t/m/Y", strtotime($datec));
	        $startDate = "01/".$hash[0]."/".$hash[1];
	        $qb->andWhere($alias.'.'.$dateFilter.' BETWEEN \''.$startDate.'\' AND \''.$endDate.'\'');
	     } else {
	      	$qb = $qb->andWhere($alias.'.'.$dateFilter.' = :'.$dateFilter);
	        $qb = $qb->setParameter($dateFilter, \DateTime::createFromFormat('m/d/Y', $value), 'date');
	     }
	}
}