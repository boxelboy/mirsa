<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Entity\Timesheet;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;

/**
 * WorkOrderInspectionLineItemController
 *
 * @author cps
 * @link   
 */
class TimesheetController extends Controller
{
    
    protected $workOrder;
    
    /**
     * List all Timesheet records for the selected WorkOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function timesheetsFromWorkOrderAction(WorkOrder $workOrder)
    {
        return $this->render('MirsaMirsaBundle:Timesheet:list.html.twig', array('workOrder' => $workOrder));
    }
    
    /**
     * Only fetch delivery notes associated with the selected sales order
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        
        $qb->andWhere($alias . '.workOrder = :workorder');
        $qb->setParameter('workorder',$this->workOrder->getId());

        return $qb;
    }        

}