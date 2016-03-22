<?php
namespace BusinessMan\Bundle\SupportBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * SupportCallController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class SupportCallController extends AbstractRestController
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

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'BusinessManSupportBundle:SupportCall';
    }

    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'clientName') {
            if (strtolower($filter) == 'unassigned') {
                $qb->leftJoin('e.client', 'c');
                $qb->andWhere('c.id IS NULL');
            } else {
                $qb->innerJoin('e.client', 'c');
                $qb->andWhere($qb->expr()->like('LOWER(c.name)', ':clientName'));
                $qb->setParameter('clientName', '%' . strtolower($filter) . '%');
            }

            return;
        }

        if ($field == 'open') {
            $qb->andWhere($qb->expr()->in('e.status', ':status'));

            if ($filter) {
                $qb->setParameter('status', array('New', 'Open'));
            } else {
                $qb->setParameter('status', array('Cancelled', 'Closed', 'Complete'));
            }

            return;
        }

        if ($field == 'toAction') {
            if ($field == 'Customer') {
                $field = 'Waiting For Customer Feedback';
            }

            if ($field == 'Helpdesk') {
                $field = 'Helpdesk To Action';
            }
        }

        if ($field == 'assignedToName') {
            if (strtolower($filter) == 'unassigned') {
                $qb->leftJoin('e.assignedTo', 's');
                $qb->andWhere('s.id IS NULL');
            } else {
                $qb->innerJoin('e.assignedTo', 's');
                $qb->andWhere(
                    $qb->expr()->like(
                        $qb->expr()->lower(
                            $qb->expr()->concat('s.forename', $qb->expr()->concat($qb->expr()->literal(' '), 's.surname'))
                        ),
                        ':assignedTo'
                    )
                );
                $qb->setParameter('assignedTo', '%' . strtolower($filter) . '%');
            }

            return;
        }

        parent::applyFilter($qb, $field, $filter, $global);
    }

    /**
     * Filter out broken data
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        return parent::getQueryBuilder($alias);
    }
}
