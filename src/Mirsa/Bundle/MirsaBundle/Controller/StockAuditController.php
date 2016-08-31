<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Entity\Stock;

/**
 * StockAuditController
 *
 * @author Dave Hatch
 * @link   
 */
class StockAuditController extends Controller
{

    protected $stock;
    /**
     * List all stock audit records for the selected Stock
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function stockAction(Stock $stock)
    {
        return $this->render('MirsaMirsaBundle:StockAudit:list.html.twig', array('stock' => $stock));
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
        //$qb->andWhere($alias . '.auditedTable IN (:auditedTable)');
        
        $qb->setParameter('sku', $this->stock->getSku());
        //$qb->setParameter('auditedTable', array('Stock', 'Stock_Quantity'));

        return $qb;
    }    
}