<?php
namespace BusinessMan\Bundle\JobBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * JobController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class JobController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    public function activityAssemblyAction()
    {
        
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'BusinessManJobBundle:Job';
    }

    /**
     * Only fetch jobs belonging to an existing client
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);

        $qb->leftJoin($alias . '.client', 'c');
        $qb->andWhere(
            $qb->expr()->orX(
                'c.id IS NOT NULL',
                $alias . '.client IS NULL'
            )
        );

        return $qb;
    }

    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'master') {
            $qb->andWhere('e.master = e.id');

            return;
        }

        if ($field == 'own') {
            $qb->join('e.assignments', 'a');
            $qb->andWhere('a.resource = :resource');
            $qb->setParameter('resource', $this->getUser()->getStaff()->getResource());

            return;
        }

        if ($field == 'open') {
            if ($field) {
                $qb->andWhere('e.status IN (:status)');
            } else {
                $qb->andWhere('e.status NOT IN (:status)');
            }

            $qb->setParameter('status', array('Open', 'Active'));

            return;
        }

        if ($field == 'parent') {
            $qb->andWhere('e.id != :parent');

            return;
        }

        parent::applyFilter($qb, $field, $filter, $global);
    }
}
