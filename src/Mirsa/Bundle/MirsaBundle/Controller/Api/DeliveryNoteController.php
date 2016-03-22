<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\DeliveryNote;
use Mirsa\Bundle\MirsaBundle\Entity\SalesOrder;

/**
 * DeliveryNoteController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class DeliveryNoteController extends AbstractRestController
{
    protected $salesOrder;
    
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function deliveryNotesForSalesOrderAction(SalesOrder $salesOrder, Request $request, $_format)
    {
        $this->salesOrder = $salesOrder;
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:DeliveryNote';
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
        
        $qb->andWhere($alias . '.salesOrder = :salesorder');
        $qb->setParameter('salesorder',$this->salesOrder->getId());

        return $qb;
    }    
}
