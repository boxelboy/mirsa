<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\Stock;

/**
 * StockAuditController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class StockAuditController extends AbstractRestController
{
    protected $stock;
    
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function stockAction(Stock $stock, Request $request, $_format)
    {
        $this->stock = $stock;
        
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:Audit';
    }
    
    /**
     * Only fetch audit records associated with the selected stock record
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        
        $qb->andWhere($alias . '.subject = :sku');
        $qb->andWhere($alias . '.auditedTable IN (:auditedTable)');
        
        $qb->setParameter('sku', $this->stock->getSku());
        $qb->setParameter('auditedTable', array('Stock', 'Stock_Quantity'));

        return $qb;
    }
}
