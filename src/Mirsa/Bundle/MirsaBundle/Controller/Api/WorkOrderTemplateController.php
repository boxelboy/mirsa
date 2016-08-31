<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;

/**
 * WorkOrderTemplateController
 *
 * @author cps
 * @link
 */
class WorkOrderTemplateController extends AbstractRestController
{

    /**
     * {@inheritDoc}
     */
    public function workOrdersFromTemplateAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:WorkOrder';
    }

    
    /**
     * {@inheritDoc}
     */
    protected function getSummaryColumnNames() {
        return array('e.qtyInspected', 'e.qtyAccepted', 'e.qtyRejected', 'e.customField1', 'e.customField2', 'e.customField3', 'e.customField4', 'e.customField5', 'e.customField6', 'e.customField7', 'e.customField8', 'e.customField9', 'e.customField10');
    }
    
    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'workordertemplate') {            
            $qb->andWhere('e.inspectionId = :inspectionid');
            $qb->setParameter('inspectionid',$filter);
            return;
        }
        if ($field == 'sku') {
            if ($filter != 'all') {
                $qb->andWhere('e.sku = :sku');
                $qb->setParameter('sku',$filter);
                return;
            } else {
                return;
            }
        }
        if ($field == 'toDate') {
            $qb->andWhere('e.plannedStartDate <= :toDate');
            $qb->setParameter('toDate',\DateTime::createFromFormat('m/d/Y', $filter), 'date');
            return;
        }
        if ($field == 'fromDate') {            
            $qb->andWhere('e.plannedStartDate >= :fromDate');
            $qb->setParameter('fromDate',\DateTime::createFromFormat('m/d/Y', $filter), 'date');
            return;
        }
        
        parent::applyFilter($qb, $field, $filter, $global);
    }
    
   /**
     * Only records associated with the selected Client record
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        
        if (!is_null($this->getUser()->getContact())) { 
            if ($this->getUser()->getContact()->getClient()) {
                $qb->andWhere($alias . '.client = :client');
                $qb->setParameter('client', $this->getUser()->getContact()->getClient());
            }
        }
        
        return $qb;
    }    
}
