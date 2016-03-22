<?php
namespace BusinessMan\Bundle\QuoteBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * QuoteController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class QuoteController extends AbstractRestController
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

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'BusinessManQuoteBundle:Quote';
    }

    /**
     * Fetch required associated data
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        return parent::getQueryBuilder($alias)->leftJoin($alias . '.client', 'c')->addSelect('c');
    }

    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'followUp') {
            $qb->andWhere('e.followUp <= :followUp');
            $qb->setParameter('followUp', new \DateTime($filter), 'date');

            return;
        }

        if ($field == 'active') {
            $qb->andWhere('e.status IN (:status)');
            $qb->setParameter('status', array('Active', 'Open'));

            return;
        }

        parent::applyFilter($qb, $field, $filter, $global);
    }
}
