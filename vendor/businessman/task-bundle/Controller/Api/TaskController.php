<?php
namespace BusinessMan\Bundle\TaskBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * TaskController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class TaskController extends AbstractRestController
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
        return 'BusinessManTaskBundle:Task';
    }

    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'dueDate') {
            $qb->andWhere('e.dueDate <= :dueDate');
            $qb->setParameter('dueDate', new \DateTime($filter), 'date');

            return;
        }

        if ($field == 'complete') {
            if (filter_var($filter, FILTER_VALIDATE_BOOLEAN)) {
                $qb->andWhere('e.status = :completed');
            } else {
                $qb->andWhere('e.status != :completed');
            }

            $qb->setParameter('completed', 'Completed');

            return;
        }

        parent::applyFilter($qb, $field, $filter, $global);
    }
}
