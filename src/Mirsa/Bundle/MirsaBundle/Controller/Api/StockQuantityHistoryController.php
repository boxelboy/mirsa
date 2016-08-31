<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\StockQuantityHistory;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;

/**
 * StockQuantityHistoryController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class StockQuantityHistoryController extends AbstractRestController
{
    protected $workOrder;

    /**
     * {@inheritDoc}
     */
    public function assemblyFromWorkOrderAction(WorkOrder $workOrder, Request $request, $_format)
    {
        $this->workOrder = $workOrder;
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:StockQuantityHistory';
    }

    /**
     * Only fetch stock history associated with the selected work order
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
 
        /*if (!is_null($this->getUser()->getContact())) { 
            if ($this->getUser()->getContact()->getClient()) {
                $qb->andWhere($alias . '.client = :client');
                $qb->setParameter('client', $this->getUser()->getContact()->getClient());
            }
        }*/

        return $qb;
    }
}
