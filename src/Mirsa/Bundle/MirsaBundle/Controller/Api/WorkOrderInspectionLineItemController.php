<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrderInspectionLineItem;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;

/**
 * JobInspectionLineItemController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class WorkOrderInspectionLineItemController extends AbstractRestController
{
        protected $workOrder;

 
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function inspectionLineItemsFromWorkOrderAction(WorkOrder $workOrder, Request $request, $_format)
    {
        $this->workOrder = $workOrder;
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:WorkOrderInspectionLineItem';
    }
    
    /**
     * Only fetch Work Order Inspection Line Items associated with the selected sales order
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
