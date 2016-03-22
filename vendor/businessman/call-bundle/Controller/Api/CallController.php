<?php
namespace BusinessMan\Bundle\CallBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * CallController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CallBundle
 */
class CallController extends AbstractRestController
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
        return 'BusinessManCallBundle:Call';
    }

    /**
     * Only fetch calls belonging to an existing client
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);

        $qb->innerJoin($alias . '.client', 'c');
        $qb->addSelect('c');

        return $qb;
    }

    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'contactDate') {
            $qb->andWhere('e.contactDate <= :contactDate');
            $qb->setParameter('contactDate', new \DateTime($filter), 'date');

            return;
        }

        if ($field == 'completed') {
            $qb->andWhere('e.completed = :completed');
            $qb->setParameter('completed', filter_var($filter, FILTER_VALIDATE_BOOLEAN), 'yesno');

            return;
        }

        parent::applyFilter($qb, $field, $filter, $global);
    }
}
