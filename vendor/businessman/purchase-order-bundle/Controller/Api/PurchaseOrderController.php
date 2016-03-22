<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * PurchaseOrderController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class PurchaseOrderController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_USER')")
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);

        if ($this->getUser()->getSupplier()) {
            $qb->andWhere($alias . '.supplier = :supplier');
            $qb->setParameter('supplier', $this->getUser()->getSupplier());
        }

        return $qb;
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'BusinessManPurchaseOrderBundle:PurchaseOrder';
    }
}
