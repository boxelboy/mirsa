<?php
namespace BusinessMan\Bundle\JobBundle\Form\Type;

use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * QuickTimesheetType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class QuickTimesheetType extends AbstractType
{
    /**
     * {@inheritDoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add(
            'job',
            'entity',
            array(
                'class' => 'BusinessMan\Bundle\JobBundle\Entity\Job',
                'required' => false,
                'property' => 'displayName',
                'group_by' => 'client.name',
                'attr' => array('class' => 'chosen'),
                'query_builder' => function (EntityRepository $repository) use ($builder) {
                    return $repository->createQueryBuilder('j')
                        ->innerJoin('j.assignments', 'a')
                        ->innerJoin('j.client', 'c')
                        ->addSelect('c')
                        ->andWhere('a.resource = :resource')
                        ->andWhere('j.status IN (:status)')
                        ->setParameter('resource', $builder->getData()->getStaff()->getResource())
                        ->setParameter('status', array('Active', 'Open'))
                        ->addOrderBy('c.name', 'ASC')
                        ->addOrderBy('j.id', 'ASC')
                        ->addOrderBy('j.description', 'ASC');
                }
            )
        );

        $builder->add(
            'supportCall',
            'entity',
            array(
                'class' => 'BusinessMan\Bundle\SupportBundle\Entity\SupportCall',
                'required' => false,
                'property' => 'displayName',
                'group_by' => 'client.name',
                'attr' => array('class' => 'chosen'),
                'query_builder' => function (EntityRepository $repository) use ($builder) {
                        $qb = $repository->createQueryBuilder('s');
                        $qb->leftJoin('s.messages', 'm')
                            ->innerJoin('s.client', 'c')
                            ->addSelect('c')
                            ->andWhere(
                                $qb->expr()->orX(
                                    $qb->expr()->andX(
                                        's.status IN (:status)',
                                        's.assignedTo = :assignedTo'
                                    ),
                                    $qb->expr()->andX(
                                        'm.created > :created',
                                        'm.staff = :author'
                                    )
                                )
                            )
                            ->setParameter('author', $builder->getData()->getStaff())
                            ->setParameter('assignedTo', $builder->getData()->getStaff())
                            ->setParameter('created', new \DateTime('-7 days'))
                            ->setParameter('status', array('New', 'Open'))
                            ->addOrderBy('c.name', 'ASC')
                            ->addOrderBy('s.id', 'ASC')
                            ->addOrderBy('s.description', 'ASC');

                        return $qb;
                    }
            )
        );

        $builder->add('dateFrom', 'date', array('widget' => 'single_text', 'label' => 'Date'));
        $builder->add('timeFrom', 'time', array('widget' => 'single_text', 'label' => 'Start', 'required' => false));
        $builder->add('timeTo', 'time', array('widget' => 'single_text', 'label' => 'Finish', 'required' => false));
        $builder->add('timeValue', null, array('required' => false, 'label' => 'Hours'));
        $builder->add('notes', 'textarea');

        $builder->add('save', 'submit');
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'BusinessMan\Bundle\JobBundle\Entity\Timesheet',
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'quick_timesheet';
    }
}
